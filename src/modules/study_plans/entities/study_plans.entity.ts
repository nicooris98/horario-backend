import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import { Degree } from '../../degrees/entities/degrees.entity';
import { StudyPlanShift } from '../../study_plan_shifts/entities/study_plan_shift.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('planes_estudio')
@Index('UQ_planes_estudio_resolucion', ['resolucion_ministerial'], {
    unique: true,
})
export class StudyPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    resolucion_ministerial: string;

    @Column()
    anio_implementacion: number;

    @Column()
    nombre: string;

    @Column({ type: 'date' })
    fecha_desde: string;

    @Column({ type: 'date', nullable: true })
    fecha_hasta: string | null;

    @Column({ default: true })
    estado: boolean;

    @ManyToOne(() => Degree, (degree) => degree.planes_estudio, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'carrera_id' })
    carrera: Degree;

    @RelationId((studyPlan: StudyPlan) => studyPlan.carrera)
    carrera_id: number;

    @OneToMany(() => StudyPlanShift, (studyPlanShift) => studyPlanShift.plan_estudio)
    planes_estudio: StudyPlanShift[];

    @OneToMany(() => Subject, (subject) => subject.plan_estudio)
    asignaturas: Subject[];
}