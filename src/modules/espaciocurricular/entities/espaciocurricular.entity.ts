import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlanEstudio } from "../../planestudio/entities/planestudio.entity";
import { Regimen } from "../../regimen/entities/regiman.entity";
import { EspacioCurricularCursoDivision } from "../../espaciocurricularcursodivision/entities/espaciocurricularcursodivision.entity";

@Index("espacio_curricular_pkey", ["idEspacioCurricular"], { unique: true })
@Entity("espacio_curricular", { schema: "public" })
export class EspacioCurricular {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_espacio_curricular" })
  idEspacioCurricular: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @Column("integer", { name: "anio_cursado", nullable: true })
  anioCursado: number | null;

  @Column("integer", { name: "horas_semanales", nullable: true })
  horasSemanales: number | null;

  @Column("boolean", { name: "permite_multiple_docente", nullable: true })
  permiteMultipleDocente: boolean | null;

  @Column("integer", { name: "max_docentes", nullable: true })
  maxDocentes: number | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @ManyToOne(() => PlanEstudio, (planEstudio) => planEstudio.espacioCurriculars)
  @JoinColumn([
    { name: "id_plan_estudio", referencedColumnName: "idPlanEstudio" },
  ])
  idPlanEstudio: PlanEstudio;

  @ManyToOne(() => Regimen, (regimen) => regimen.espacioCurriculars)
  @JoinColumn([{ name: "id_regimen", referencedColumnName: "idRegimen" }])
  idRegimen: Regimen;

  @OneToMany(
    () => EspacioCurricularCursoDivision,
    (espacioCurricularCursoDivision) =>
      espacioCurricularCursoDivision.idEspacioCursado
  )
  espacioCurricularCursoDivisions: EspacioCurricularCursoDivision[];
}
