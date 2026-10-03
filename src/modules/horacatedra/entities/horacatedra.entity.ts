import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Horario } from "../../horario/entities/horario.entity";

@Index("hora_catedra_pkey", ["idHoraCatedra"], { unique: true })
@Entity("hora_catedra", { schema: "public" })
export class HoraCatedra {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_hora_catedra" })
  idHoraCatedra: number;

  @Column("integer", { name: "numero_franja", nullable: true })
  numeroFranja: number | null;

  @Column("time without time zone", { name: "hora_desde", nullable: true })
  horaDesde: string | null;

  @Column("time without time zone", { name: "hora_hasta", nullable: true })
  horaHasta: string | null;

  @OneToMany(() => Horario, (horario) => horario.idHoraCatedra)
  horarios: Horario[];
}
