import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { AcademicCycle } from '../../academic_cycles/entities/academic_cycle.entity';
import { Degree } from '../../degrees/entities/degrees.entity';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';
import { ClassPeriod } from '../../class_periods/entities/class_period.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { CourseSectionAssignment } from '../../course_section_assignments/entities/course_section_assignment.entity';

@Entity('cursos_division')
export class CourseSection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AcademicCycle, (academicCycle) => academicCycle.courseSections, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_ciclo' })
  academicCycle: AcademicCycle;

  @RelationId((courseSection: CourseSection) => courseSection.academicCycle)
  academicCycleId: number;

  @ManyToOne(() => StudyPlan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_plan' })
  studyPlan: StudyPlan;

  @RelationId((courseSection: CourseSection) => courseSection.studyPlan)
  studyPlanId: number;

  @ManyToOne(() => Degree, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_carrera' })
  degree: Degree;

  @RelationId((courseSection: CourseSection) => courseSection.degree)
  degreeId: number;

  @ManyToOne(() => ClassPeriod, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_turno' })
  classPeriod: ClassPeriod;

  @RelationId((courseSection: CourseSection) => courseSection.classPeriod)
  classPeriodId: number;

  @Column({ name: 'anio_cursado', type: 'integer' })
  courseYear: number;

  @Column({ name: 'division' })
  section: string;

  @Column({ name: 'fecha_apertura', type: 'date' })
  openingDate: string;

  @Column({ name: 'fecha_cierre', type: 'date', nullable: true })
  closingDate: string | null;

  @Column({ name: 'estado', default: true })
  status: boolean;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.courseSection)
  enrollments: Enrollment[];

  @OneToMany(() => CourseSectionAssignment, (assignment) => assignment.courseSection)
  assignments: CourseSectionAssignment[];
}
