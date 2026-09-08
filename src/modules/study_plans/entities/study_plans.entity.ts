import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import { Degree } from '../../degrees/entities/degrees.entity';

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
}