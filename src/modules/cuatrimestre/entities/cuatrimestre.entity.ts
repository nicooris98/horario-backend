import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Horario } from "../../horario/entities/horario.entity";

@Index("cuatrimestre_pkey", ["idCuatrimestre"], { unique: true })
@Entity("cuatrimestre", { schema: "public" })
export class Cuatrimestre {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_cuatrimestre" })
  idCuatrimestre: number;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @Column("integer", { name: "numero", nullable: true })
  numero: number | null;

  @Column("date", { name: "fecha_desde", nullable: true })
  fechaDesde: string | null;

  @Column("date", { name: "fecha_hasta", nullable: true })
  fechaHasta: string | null;

  @OneToMany(() => Horario, (horario) => horario.idCuatrimestre)
  horarios: Horario[];
}
