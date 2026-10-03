import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlanEstudioCicloLectivo } from "../../planestudiociclolectivo/entities/planestudiociclolectivo.entity";

@Index("ciclo_lectivo_pkey", ["idCicloLectivo"], { unique: true })
@Entity("ciclo_lectivo", { schema: "public" })
export class Ciclolectivo {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_ciclo_lectivo" })
  idCicloLectivo: number;

  @Column("integer", { name: "anio", nullable: true })
  anio: number | null;

  @Column("date", { name: "fecha_inicio", nullable: true })
  fechaInicio: string | null;

  @Column("date", { name: "fecha_fin", nullable: true })
  fechaFin: string | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @OneToMany(
    () => PlanEstudioCicloLectivo,
    (planEstudioCicloLectivo) => planEstudioCicloLectivo.idCicloLectivo
  )
  planEstudioCicloLectivos: PlanEstudioCicloLectivo[];
}
