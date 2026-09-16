import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import { Degree } from '../../degrees/entities/degrees.entity';
import { Subject } from '../../curriculum_subjects/entities/subject.entity';

@Entity('planes_estudio')
export class StudyPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre' })
    name: string;

    @Column({ name: 'resolucion_ministerial' })
    ministerialResolution: string;

    @Column({ name: 'duracion_anios', type: 'float' })
    durationYears: number;

    @Column({ name: 'anio_vigencia', type: 'integer' })
    validityYear: number;

    @Column({ name: 'fecha_desde', type: 'date' })
    startDate: string;

    @Column({ name: 'fecha_hasta', type: 'date', nullable: true })
    endDate: string | null;

    @Column({ name: 'estado', default: true })
    status: boolean;

    @ManyToOne(() => Degree, (degree) => degree.studyPlans, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'id_carrera' })
    degree: Degree;

    @RelationId((studyPlan: StudyPlan) => studyPlan.degree)
    degreeId: number;

    @OneToMany(() => Subject, (subject) => subject.studyPlan)
    curriculumSubjects: Subject[];

}