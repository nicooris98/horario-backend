import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AsignacionDocente as AsignacionDocente } from "../../asignaciondocente/entities/asignaciondocente.entity";
import { Cursodivision as CursoDivision } from "../../cursodivision/entities/cursodivision.entity";
import { EspacioCurricular } from "../../espaciocurricular/entities/espaciocurricular.entity";
import { Horario } from "../../horario/entities/horario.entity";

@Index(
  "espacio_curricular_curso_division_pkey",
  ["idEspacioCurricularCursoDivision"],
  { unique: true }
)
@Entity("espacio_curricular_curso_division", { schema: "public" })
export class EspacioCurricularCursoDivision {
  @PrimaryGeneratedColumn({
    type: "integer",
    name: "id_espacio_curricular_curso_division",
  })
  idEspacioCurricularCursoDivision: number;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @OneToMany(
    () => AsignacionDocente,
    (asignacionDocente) => asignacionDocente.idEspacioCurricularCursoDivision
  )
  asignacionDocentes: AsignacionDocente[];

  @ManyToOne(
    () => CursoDivision,
    (cursoDivision) => cursoDivision.espacioCurricularCursoDivisions
  )
  @JoinColumn([
    { name: "id_curso_division", referencedColumnName: "idCursoDivision" },
  ])
  idCursoDivision: CursoDivision;

  @ManyToOne(
    () => EspacioCurricular,
    (espacioCurricular) => espacioCurricular.espacioCurricularCursoDivisions
  )
  @JoinColumn([
    { name: "id_espacio_cursado", referencedColumnName: "idEspacioCurricular" },
  ])
  idEspacioCursado: EspacioCurricular;

  @OneToMany(() => Horario, (horario) => horario.idCursado)
  horarios: Horario[];
}
