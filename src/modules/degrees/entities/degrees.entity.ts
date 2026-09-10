import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';

@Entity('carreras')
export class Degree {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ type: 'integer' })
    duracion_anios: number;

    @Column({ default: true })
    estado: boolean;

    @OneToMany(() => StudyPlan, (studyPlan) => studyPlan.carrera)
    planes_estudio: StudyPlan[];
}
