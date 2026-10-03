import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AsignacionDocente as AsignacionDocente } from "../../asignaciondocente/entities/asignaciondocente.entity";

@Index("docente_pkey", ["idDocente"], { unique: true })
@Entity("docente", { schema: "public" })
export class Docente {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_docente" })
  idDocente: number;

  @Column("character varying", { name: "dni", nullable: true, length: 255 })
  dni: string | null;

  @Column("character varying", { name: "nombre", nullable: true, length: 255 })
  nombre: string | null;

  @Column("character varying", {
    name: "apellido",
    nullable: true,
    length: 255,
  })
  apellido: string | null;

  @Column("character varying", {
    name: "telefono",
    nullable: true,
    length: 255,
  })
  telefono: string | null;

  @Column("character varying", { name: "email", nullable: true, length: 255 })
  email: string | null;

  @Column("integer", { name: "legajo", nullable: true })
  legajo: number | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @OneToMany(
    () => AsignacionDocente,
    (asignacionDocente) => asignacionDocente.idDocente
  )
  asignacionDocentes: AsignacionDocente[];
}
