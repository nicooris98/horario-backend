import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { CourseSection } from '../../course_sections/entities/course_section.entity';

@Entity('cursos_division_asignaciones')
export class CourseSectionAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_asignacion', type: 'integer' })
  assignmentId: number;

  @ManyToOne(() => CourseSection, (courseSection) => courseSection.assignments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_curso_division' })
  courseSection: CourseSection;

  @RelationId((assignment: CourseSectionAssignment) => assignment.courseSection)
  courseSectionId: number;
}
