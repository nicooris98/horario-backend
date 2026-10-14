import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseSection } from '../../course_sections/entities/course_section.entity';
import { Subject } from '../../curriculum_subjects/entities/subject.entity';

// Entidad mínima para que el Módulo 2 pueda asignar docentes a una materia
// de una división. El CRUD de esta tabla le corresponde al Módulo 1 (#13).
@Entity('espacio_curricular_curso_division')
export class CourseSectionSubject {
  @PrimaryGeneratedColumn({ name: 'id_espacio_curricular_curso_division' })
  id: number;

  @ManyToOne(() => CourseSection, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_curso_division' })
  courseSection: CourseSection;

  @ManyToOne(() => Subject, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_espacio_cursado' })
  subject: Subject;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;
}
