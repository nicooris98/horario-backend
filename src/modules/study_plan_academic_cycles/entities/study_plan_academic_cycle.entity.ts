import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AcademicCycle } from '../../academic_cycles/entities/academic_cycle.entity';
import { CourseSection } from '../../course_sections/entities/course_section.entity';
import { Shift } from '../../shifts/entities/shift.entity';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';

@Entity('plan_estudio_ciclo_lectivo')
export class StudyPlanAcademicCycle {
  @PrimaryGeneratedColumn({ name: 'id_plan_estudio_ciclo_lectivo' })
  id: number;

  @ManyToOne(() => StudyPlan, (plan) => plan.studyPlanAcademicCycles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_plan_estudio' })
  studyPlan: StudyPlan;

  @ManyToOne(() => AcademicCycle, (cycle) => cycle.studyPlanAcademicCycles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_ciclo_lectivo' })
  academicCycle: AcademicCycle;

  @ManyToOne(() => Shift, (shift) => shift.studyPlanAcademicCycles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_turno' })
  shift: Shift;

  @OneToMany(() => CourseSection, (section) => section.studyPlanAcademicCycle)
  courseSections: CourseSection[];
}
