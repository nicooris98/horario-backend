import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StudyPlanAcademicCycle } from '../../study-plan-academic-cycles/entities/study-plan-academic-cycle.entity';

@Entity('curso_division')
export class CourseSection {
  @PrimaryGeneratedColumn({ name: 'id_curso_division' })
  id: number;

  @ManyToOne(() => StudyPlanAcademicCycle, (spc) => spc.courseSections, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_plan_estudio_ciclo_lectivo' })
  studyPlanAcademicCycle: StudyPlanAcademicCycle;

  @Column({ name: 'anio_cursado', type: 'integer' })
  courseYear: number;

  @Column({ name: 'division' })
  section: string;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;
}
