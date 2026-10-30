import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseSection } from '../../course-sections/entities/course-section.entity';
import { Subject } from '../../curriculum-subjects/entities/subject.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { TeacherAssignment } from '../../teacher-assignments/entities/teacher-assignment.entity';

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

  // --- Relaciones inversas agregadas para el Módulo 3 ---
  
  @OneToMany(() => TeacherAssignment, (ta) => ta.courseSectionSubject)
  teacherAssignments: TeacherAssignment[];

  @OneToMany(() => Schedule, (schedule) => schedule.courseSectionSubject)
  schedules: Schedule[];
}