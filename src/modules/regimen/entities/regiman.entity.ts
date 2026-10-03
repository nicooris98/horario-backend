import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EspacioCurricular } from "../../espaciocurricular/entities/espaciocurricular.entity";

@Index("regimen_pkey", ["idRegimen"], { unique: true })
@Entity("regimen", { schema: "public" })
export class Regimen {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_regimen" })
  idRegimen: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @OneToMany(
    () => EspacioCurricular,
    (espacioCurricular) => espacioCurricular.idRegimen
  )
  espacioCurriculars: EspacioCurricular[];
}
