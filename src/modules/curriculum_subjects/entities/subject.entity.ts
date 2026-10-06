import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';
import { Regime } from '../../regimes/entities/regime.entity';

@Entity('espacio_curricular')
@Index('UQ_espacio_curricular_plan_nombre', ['studyPlan', 'name'], {
  unique: true,
})
export class Subject {
  @PrimaryGeneratedColumn({ name: 'id_espacio_curricular' })
  id: number;

  @ManyToOne(() => StudyPlan, (studyPlan) => studyPlan.curriculumSubjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_plan_estudio' })
  studyPlan: StudyPlan;

  @ManyToOne(() => Regime, (regime) => regime.subjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_regimen' })
  regime: Regime;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'anio_cursado', type: 'integer' })
  year: number;

  @Column({ name: 'horas_semanales', type: 'integer' })
  weeklyHours: number;

  @Column({ name: 'permite_multiple_docente' })
  allowsMultipleTeachers: boolean;

  @Column({ name: 'max_docentes', type: 'integer', nullable: true })
  maxTeachers: number | null;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;
}
