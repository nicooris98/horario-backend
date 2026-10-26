import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface CheckOverlapParams {
  idEccd: number;
  idDia: number;
  idHoraCatedra: number;
  fechaDesde: string;
  fechaHasta: string | null;
  excludeIdHorario?: number;
}

export interface OverlapConflict {
  idDocenteEfectivo: number;
  nombreDocente: string;
  apellidoDocente: string;
  idHorarioExistente: number;
  idEccdOrigen: number;
  conflictoDesde: string;
  conflictoHasta: string | null;
}

@Injectable()
export class ScheduleOverlapService {
  constructor(private readonly dataSource: DataSource) {}

  async checkOverlap(params: CheckOverlapParams): Promise<OverlapConflict[]> {
    const {
      idEccd,
      idDia,
      idHoraCatedra,
      fechaDesde,
      fechaHasta,
      excludeIdHorario,
    } = params;

    // Nota: TypeORM con PostgreSQL usa $1, $2 para los parámetros en consultas nativas.
    const sql = `
      WITH
      params AS (
        SELECT
          $1::integer AS id_eccd,
          $2::integer AS id_dia,
          $3::integer AS id_hora_catedra,
          $4::date AS fecha_desde,
          $5::date AS fecha_hasta,
          $6::integer AS id_horario_excluir
      ),
      new_slot AS (
        SELECT
          p.*,
          daterange(
            p.fecha_desde,
            CASE
              WHEN p.fecha_hasta IS NULL THEN NULL
              ELSE p.fecha_hasta + 1
            END,
            '[)'
          ) AS schedule_window,
          hc.hora_desde AS new_hora_desde,
          hc.hora_hasta AS new_hora_hasta
        FROM params p
        JOIN hora_catedra hc ON hc.id_hora_catedra = p.id_hora_catedra
      ),
      schedule_windows AS (
        -- El horario que se intenta crear
        SELECT
          -1::bigint AS scope_id,
          'new'::text AS scope_kind,
          NULL::integer AS id_horario,
          ns.id_eccd AS id_eccd,
          ns.schedule_window
        FROM new_slot ns

        UNION ALL

        -- Horarios existentes
        SELECT
          h.id_horario::bigint AS scope_id,
          'existing'::text AS scope_kind,
          h.id_horario,
          h.id_cursado AS id_eccd,
          daterange(
            h.fecha_desde,
            CASE
              WHEN h.fecha_hasta IS NULL THEN NULL
              ELSE h.fecha_hasta + 1
            END,
            '[)'
          ) AS schedule_window
        FROM horario h
        JOIN hora_catedra old_hc ON old_hc.id_hora_catedra = h.id_hora_catedra
        CROSS JOIN new_slot ns
        WHERE h.id_dia = ns.id_dia
          AND h.fecha_desde IS NOT NULL
          AND (ns.id_horario_excluir IS NULL OR h.id_horario <> ns.id_horario_excluir)
          AND ns.new_hora_desde < old_hc.hora_hasta
          AND old_hc.hora_desde < ns.new_hora_hasta
          AND daterange(
                h.fecha_desde,
                CASE
                  WHEN h.fecha_hasta IS NULL THEN NULL
                  ELSE h.fecha_hasta + 1
                END,
                '[)'
              ) && ns.schedule_window
      ),
      raw_assignment_windows AS (
        SELECT
          sw.scope_id,
          sw.scope_kind,
          sw.id_horario,
          sw.id_eccd,
          a.id_asignacion_docente AS id_asignacion,
          a.id_docente,
          a.id_asignacion_titular AS id_asignacion_titular,
          sw.schedule_window * daterange(
            a.fecha_desde,
            CASE
              WHEN a.fecha_hasta IS NULL THEN NULL
              ELSE a.fecha_hasta + 1
            END,
            '[)'
          ) AS assignment_window
        FROM schedule_windows sw
        JOIN asignacion_docente a ON a.id_espacio_curricular_curso_division = sw.id_eccd
        WHERE a.fecha_desde IS NOT NULL
          AND NOT isempty(
            sw.schedule_window * daterange(
              a.fecha_desde,
              CASE
                WHEN a.fecha_hasta IS NULL THEN NULL
                ELSE a.fecha_hasta + 1
              END,
              '[)'
            )
          )
      ),
      effective_windows AS (
        -- Titulares (excluyendo la porción donde un suplente está activo)
        SELECT
          r.scope_id,
          r.scope_kind,
          r.id_horario,
          r.id_eccd,
          r.id_asignacion,
          r.id_docente,
          effective_window
        FROM raw_assignment_windows r
        CROSS JOIN LATERAL unnest(
          datemultirange(r.assignment_window) -
          COALESCE(
            (
              SELECT range_agg(s.assignment_window)
              FROM raw_assignment_windows s
              WHERE s.scope_id = r.scope_id
                AND s.id_asignacion_titular = r.id_asignacion
            ),
            '{}'::datemultirange
          )
        ) AS effective_window
        WHERE r.id_asignacion_titular IS NULL

        UNION ALL

        -- Suplentes (efectivos en toda su ventana)
        SELECT
          r.scope_id,
          r.scope_kind,
          r.id_horario,
          r.id_eccd,
          r.id_asignacion,
          r.id_docente,
          r.assignment_window
        FROM raw_assignment_windows r
        WHERE r.id_asignacion_titular IS NOT NULL
      ),
      conflicts AS (
        SELECT
          n.id_docente AS id_docente_efectivo,
          n.id_asignacion AS id_asignacion_nueva,
          ns.id_eccd AS id_eccd_nuevo,
          e.id_horario AS id_horario_existente,
          e.id_eccd AS id_eccd_origen,
          e.id_asignacion AS id_asignacion_existente,
          n.effective_window * e.effective_window AS overlap_window
        FROM effective_windows n
        JOIN effective_windows e
          ON e.scope_kind = 'existing'
         AND e.id_docente = n.id_docente
         AND e.effective_window && n.effective_window
        CROSS JOIN new_slot ns
        WHERE n.scope_kind = 'new'
      )
      SELECT DISTINCT
        c.id_docente_efectivo AS "idDocenteEfectivo",
        t.nombre AS "nombreDocente",
        t.apellido AS "apellidoDocente",
        c.id_horario_existente AS "idHorarioExistente",
        c.id_eccd_origen AS "idEccdOrigen",
        lower(c.overlap_window)::text AS "conflictoDesde",
        (upper(c.overlap_window) - 1)::text AS "conflictoHasta"
      FROM conflicts c
      JOIN docente t ON t.id_docente = c.id_docente_efectivo
      ORDER BY c.id_docente_efectivo, c.id_horario_existente;
    `;

    // Pasamos null si excludeIdHorario es undefined
    const queryParams = [
      idEccd,
      idDia,
      idHoraCatedra,
      fechaDesde,
      fechaHasta,
      excludeIdHorario || null,
    ];

    return this.dataSource.query(sql, queryParams);
  }
}