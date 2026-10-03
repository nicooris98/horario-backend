import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cursodivision as CursoDivision } from "../../cursodivision/entities/cursodivision.entity";
import { Ciclolectivo as CicloLectivo } from "../../ciclolectivo/entities/ciclolectivo.entity";
import { PlanEstudio } from "../../planestudio/entities/planestudio.entity";
import { Turno } from "../../tipocargo/entities/tipocargo.entity";

@Index("plan_estudio_ciclo_lectivo_pkey", ["idPlanEstudioCicloLectivo"], {
  unique: true,
})
@Entity("plan_estudio_ciclo_lectivo", { schema: "public" })
export class PlanEstudioCicloLectivo {
  @PrimaryGeneratedColumn({
    type: "integer",
    name: "id_plan_estudio_ciclo_lectivo",
  })
  idPlanEstudioCicloLectivo: number;

  @OneToMany(
    () => CursoDivision,
    (cursoDivision) => cursoDivision.idPlanEstudioCicloLectivo
  )
  cursoDivisions: CursoDivision[];

  @ManyToOne(
    () => CicloLectivo,
    (cicloLectivo) => cicloLectivo.planEstudioCicloLectivos
  )
  @JoinColumn([
    { name: "id_ciclo_lectivo", referencedColumnName: "idCicloLectivo" },
  ])
  idCicloLectivo: CicloLectivo;

  @ManyToOne(
    () => PlanEstudio,
    (planEstudio) => planEstudio.planEstudioCicloLectivos
  )
  @JoinColumn([
    { name: "id_plan_estudio", referencedColumnName: "idPlanEstudio" },
  ])
  idPlanEstudio: PlanEstudio;

  @ManyToOne(() => Turno, (turno) => turno.planEstudioCicloLectivos)
  @JoinColumn([{ name: "id_turno", referencedColumnName: "idTurno" }])
  idTurno: Turno;
}
