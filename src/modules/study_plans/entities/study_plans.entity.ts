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

@Entity('planes_estudio')
@Index('UQ_planes_estudio_resolucion', ['resolucion_ministerial'], {
    unique: true,
})
@Index('UQ_planes_estudio_carrera_vigente', ['carrera'], {
    unique: true,
    where: '"vigente" = true',
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

    @Column({ type: 'float' })
    duracion: number;

    @Column({ default: false })
    vigente: boolean;

    @Column({ default: true })
    activa: boolean;

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
}