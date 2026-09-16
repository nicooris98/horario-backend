import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';

@Entity('carreras')
export class Degree {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre' })
    name: string;

    @Column({ name: 'estado', default: true })
    status: boolean;

    @OneToMany(() => StudyPlan, (studyPlan) => studyPlan.degree)
    studyPlans: StudyPlan[];
}
