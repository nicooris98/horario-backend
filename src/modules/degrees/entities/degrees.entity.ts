import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudyPlan } from '../../study-plans/entities/study-plans.entity';

@Entity('carrera')
export class Degree {
  @PrimaryGeneratedColumn({ name: 'id_carrera' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @OneToMany(() => StudyPlan, (studyPlan) => studyPlan.degree)
  studyPlans: StudyPlan[];
}
