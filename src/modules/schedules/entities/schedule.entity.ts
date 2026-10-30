import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseSectionSubject } from '../../course-section-subjects/entities/course-section-subject.entity';
import { Semester } from '../../semesters/entities/semester.entity';
import { ClassHour } from '../../class-hours/entities/class-hour.entity';
import { Day } from './day.entity';

@Entity('horario')
export class Schedule {
  @PrimaryGeneratedColumn({ name: 'id_horario' })
  id: number;

  @ManyToOne(() => CourseSectionSubject, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_cursado' })
  courseSectionSubject: CourseSectionSubject;

  @ManyToOne(() => Semester, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_cuatrimestre' })
  semester: Semester;

  @ManyToOne(() => ClassHour, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_hora_catedra' })
  classHour: ClassHour;

  @ManyToOne(() => Day, (day) => day.schedules, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_dia' })
  day: Day;

  @Column({ name: 'fecha_desde', type: 'date' })
  startDate: string;

  @Column({ name: 'fecha_hasta', type: 'date', nullable: true })
  endDate: string | null;
}