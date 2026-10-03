import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlanEstudioCicloLectivo } from "../../planestudiociclolectivo/entities/planestudiociclolectivo.entity";
import { EspacioCurricularCursoDivision } from "../../espaciocurricularcursodivision/entities/espaciocurricularcursodivision.entity";

@Index("curso_division_pkey", ["idCursoDivision"], { unique: true })
@Entity("curso_division", { schema: "public" })
export class Cursodivision {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_curso_division" })
  idCursoDivision: number;

  @Column("integer", { name: "anio_cursado", nullable: true })
  anioCursado: number | null;

  @Column("character varying", {
    name: "division",
    nullable: true,
    length: 255,
  })
  division: string | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @ManyToOne(
    () => PlanEstudioCicloLectivo,
    (planEstudioCicloLectivo) => planEstudioCicloLectivo.cursoDivisions
  )
  @JoinColumn([
    {
      name: "id_plan_estudio_ciclo_lectivo",
      referencedColumnName: "idPlanEstudioCicloLectivo",
    },
  ])
  idPlanEstudioCicloLectivo: PlanEstudioCicloLectivo;

  @OneToMany(
    () => EspacioCurricularCursoDivision,
    (espacioCurricularCursoDivision) =>
      espacioCurricularCursoDivision.idCursoDivision
  )
  espacioCurricularCursoDivisions: EspacioCurricularCursoDivision[];
}
