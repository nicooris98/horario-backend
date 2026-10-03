import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Docente } from "../../docente/entities/docente.entity";
import { EspacioCurricularCursoDivision } from "../../espaciocurricularcursodivision/entities/espaciocurricularcursodivision.entity";
import { TipoCargo } from "../../tipocargo/entities/tipocargo.entity";

@Index("asignacion_docente_pkey", ["idAsignacionDocente"], { unique: true })
@Entity("asignacion_docente", { schema: "public" })
export class AsignacionDocente {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_asignacion_docente" })
  idAsignacionDocente: number;

  @Column("date", { name: "fecha_desde", nullable: true })
  fechaDesde: string | null;

  @Column("date", { name: "fecha_hasta", nullable: true })
  fechaHasta: string | null;

  @ManyToOne(() => Docente, (docente) => docente.asignacionDocentes)
  @JoinColumn([{ name: "id_docente", referencedColumnName: "idDocente" }])
  idDocente: Docente;

  @ManyToOne(
    () => EspacioCurricularCursoDivision,
    (espacioCurricularCursoDivision) =>
      espacioCurricularCursoDivision.asignacionDocentes
  )
  @JoinColumn([
    {
      name: "id_espacio_curricular_curso_division",
      referencedColumnName: "idEspacioCurricularCursoDivision",
    },
  ])
  idEspacioCurricularCursoDivision: EspacioCurricularCursoDivision;

  @ManyToOne(() => TipoCargo, (tipoCargo) => tipoCargo.asignacionDocentes)
  @JoinColumn([{ name: "id_tipo_cargo", referencedColumnName: "idTipoCargo" }])
  idTipoCargo: TipoCargo;
}
