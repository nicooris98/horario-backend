import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cuatrimestre } from "../../cuatrimestre/entities/cuatrimestre.entity";
import { EspacioCurricularCursoDivision } from "../../espaciocurricularcursodivision/entities/espaciocurricularcursodivision.entity";
import { Dia } from "../../dia/entities/dia.entity";
import { HoraCatedra } from "../../horacatedra/entities/horacatedra.entity";

@Index("horario_pkey", ["idHorario"], { unique: true })
@Entity("horario", { schema: "public" })
export class Horario {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_horario" })
  idHorario: number;

  @Column("date", { name: "fecha_desde", nullable: true })
  fechaDesde: string | null;

  @Column("date", { name: "fecha_hasta", nullable: true })
  fechaHasta: string | null;

  @ManyToOne(() => Cuatrimestre, (cuatrimestre) => cuatrimestre.horarios)
  @JoinColumn([
    { name: "id_cuatrimestre", referencedColumnName: "idCuatrimestre" },
  ])
  idCuatrimestre: Cuatrimestre;

  @ManyToOne(
    () => EspacioCurricularCursoDivision,
    (espacioCurricularCursoDivision) => espacioCurricularCursoDivision.horarios
  )
  @JoinColumn([
    {
      name: "id_cursado",
      referencedColumnName: "idEspacioCurricularCursoDivision",
    },
  ])
  idCursado: EspacioCurricularCursoDivision;

  @ManyToOne(() => Dia, (dia) => dia.horarios)
  @JoinColumn([{ name: "id_dia", referencedColumnName: "idDia" }])
  idDia: Dia;

  @ManyToOne(() => HoraCatedra, (horaCatedra) => horaCatedra.horarios)
  @JoinColumn([
    { name: "id_hora_catedra", referencedColumnName: "idHoraCatedra" },
  ])
  idHoraCatedra: HoraCatedra;
}
