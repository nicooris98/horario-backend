import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { CourseSection } from '../../course_sections/entities/course_section.entity';
import { Subject } from '../../curriculum_subjects/entities/subject.entity';

@Entity('cursados')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CourseSection, (courseSection) => courseSection.enrollments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_curso_division' })
  courseSection: CourseSection;

  @RelationId((enrollment: Enrollment) => enrollment.courseSection)
  courseSectionId: number;

  @ManyToOne(() => Subject, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_espacio' })
  curriculumSubject: Subject;

  @RelationId((enrollment: Enrollment) => enrollment.curriculumSubject)
  curriculumSubjectId: number;

  @Column({ name: 'estado', default: true })
  status: boolean;
}
