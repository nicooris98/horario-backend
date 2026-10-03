import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlanEstudioCicloLectivo } from "../../planestudiociclolectivo/entities/planestudiociclolectivo.entity";
import { AsignacionDocente } from "../../asignaciondocente/entities/asignaciondocente.entity";

@Index("turno_pkey", ["idTurno"], { unique: true })
@Entity("turno", { schema: "public" })
export class Turno {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_turno" })
  idTurno: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @Column("time without time zone", { name: "hora_inicio", nullable: true })
  horaInicio: string | null;

  @Column("time without time zone", { name: "hora_fin", nullable: true })
  horaFin: string | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @OneToMany(
    () => PlanEstudioCicloLectivo,
    (planEstudioCicloLectivo) => planEstudioCicloLectivo.idTurno
  )
  planEstudioCicloLectivos: PlanEstudioCicloLectivo[];
}

@Index("tipo_cargo_pkey", ["idTipoCargo"], { unique: true })
@Entity("tipo_cargo", { schema: "public" })
export class TipoCargo {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_tipo_cargo" })
  idTipoCargo: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @Column("character varying", {
    name: "descripcion",
    nullable: true,
    length: 255,
  })
  descripcion: string | null;

  @Column("boolean", { name: "admite_suplente", nullable: true })
  admiteSuplente: boolean | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @OneToMany(
    () => AsignacionDocente,
    (asignacionDocente) => asignacionDocente.idTipoCargo
  )
  asignacionDocentes: AsignacionDocente[];
}
