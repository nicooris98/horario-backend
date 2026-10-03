import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlanEstudio } from "../../planestudio/entities/planestudio.entity";

@Index("carrera_pkey", ["idCarrera"], { unique: true })
@Entity("carrera", { schema: "public" })
export class Carrera {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_carrera" })
  idCarrera: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @OneToMany(() => PlanEstudio, (planEstudio) => planEstudio.idCarrera)
  planEstudios: PlanEstudio[];
}
