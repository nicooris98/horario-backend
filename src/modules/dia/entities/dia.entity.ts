import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Horario } from "../../horario/entities/horario.entity";

@Index("dia_pkey", ["idDia"], { unique: true })
@Entity("dia", { schema: "public" })
export class Dia {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_dia" })
  idDia: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @OneToMany(() => Horario, (horario) => horario.idDia)
  horarios: Horario[];
}
