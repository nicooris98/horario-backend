import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseSectionSubject } from '../../course-section-subjects/entities/course-section-subject.entity';
import { PositionType } from '../../position-types/entities/position-type.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('asignacion_docente')
export class TeacherAssignment {
  @PrimaryGeneratedColumn({ name: 'id_asignacion_docente' })
  id: number;

  @ManyToOne(() => CourseSectionSubject, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_espacio_curricular_curso_division' })
  courseSectionSubject: CourseSectionSubject;

  @ManyToOne(() => PositionType, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_tipo_cargo' })
  positionType: PositionType;

  @ManyToOne(() => Teacher, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_docente' })
  teacher: Teacher;

  // Solo para suplencias: la asignación del titular al que reemplaza.
  @ManyToOne(() => TeacherAssignment, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_asignacion_titular' })
  replacedAssignment: TeacherAssignment | null;

  @Column({ name: 'horas_semanales', type: 'integer' })
  weeklyHours: number;

  @Column({ name: 'fecha_desde', type: 'date' })
  startDate: string;

  @Column({ name: 'fecha_hasta', type: 'date', nullable: true })
  endDate: string | null;
}
