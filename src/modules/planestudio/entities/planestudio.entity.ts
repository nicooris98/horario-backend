import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EspacioCurricular } from "../../espaciocurricular/entities/espaciocurricular.entity";
import { Carrera } from "../../carrera/entities/carrera.entity";
import { PlanEstudioCicloLectivo } from "../../planestudiociclolectivo/entities/planestudiociclolectivo.entity";

@Index("plan_estudio_pkey", ["idPlanEstudio"], { unique: true })
@Entity("plan_estudio", { schema: "public" })
export class PlanEstudio {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_plan_estudio" })
  idPlanEstudio: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @Column("integer", { name: "anio_vigencia", nullable: true })
  anioVigencia: number | null;

  @Column("date", { name: "fecha_desde", nullable: true })
  fechaDesde: string | null;

  @Column("date", { name: "fecha_hasta", nullable: true })
  fechaHasta: string | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @Column("numeric", { name: "cantidad_anios", nullable: true })
  cantidadAnios: string | null;

  @OneToMany(
    () => EspacioCurricular,
    (espacioCurricular) => espacioCurricular.idPlanEstudio
  )
  espacioCurriculars: EspacioCurricular[];

  @ManyToOne(() => Carrera, (carrera) => carrera.planEstudios)
  @JoinColumn([{ name: "id_carrera", referencedColumnName: "idCarrera" }])
  idCarrera: Carrera;

  @OneToMany(
    () => PlanEstudioCicloLectivo,
    (planEstudioCicloLectivo) => planEstudioCicloLectivo.idPlanEstudio
  )
  planEstudioCicloLectivos: PlanEstudioCicloLectivo[];
}
