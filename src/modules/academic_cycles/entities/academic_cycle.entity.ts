import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseSection } from '../../course_sections/entities/course_section.entity';

@Entity('ciclos_lectivos')
export class AcademicCycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  year: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  startDate: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  endDate: string;

  @Column({ name: 'estado', default: true })
  status: boolean;

  @OneToMany(() => CourseSection, (courseSection) => courseSection.academicCycle)
  courseSections: CourseSection[];
}
