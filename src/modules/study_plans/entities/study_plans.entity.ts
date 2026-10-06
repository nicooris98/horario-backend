import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Degree } from '../../degrees/entities/degrees.entity';
import { Subject } from '../../curriculum_subjects/entities/subject.entity';
import { StudyPlanAcademicCycle } from '../../study_plan_academic_cycles/entities/study_plan_academic_cycle.entity';

@Entity('plan_estudio')
export class StudyPlan {
  @PrimaryGeneratedColumn({ name: 'id_plan_estudio' })
  id: number;

  @ManyToOne(() => Degree, (degree) => degree.studyPlans, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_carrera' })
  degree: Degree;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'anio_vigencia', type: 'integer' })
  validityYear: number;

  @Column({ name: 'fecha_desde', type: 'date' })
  startDate: string;

  @Column({ name: 'fecha_hasta', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;

  @Column({
    name: 'cantidad_anios',
    type: 'decimal',
    precision: 4,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  durationYears: number;

  @OneToMany(() => Subject, (subject) => subject.studyPlan)
  curriculumSubjects: Subject[];

  @OneToMany(() => StudyPlanAcademicCycle, (spc) => spc.studyPlan)
  studyPlanAcademicCycles: StudyPlanAcademicCycle[];
}
