import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from "typeorm";
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';

@Entity('asignaturas')
@Index('UQ_asignaturas_plan_nombre', ['plan_estudio', 'nombre'], {
    unique: true,
})
export class Subject {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string

    @Column()
    anio_cursada: number

    @Column({ default: true })
    activa: boolean

    @Column()
    regimen_dictado: string // 'Anual' | 'Cuatrimestral' | 'Trimestral'

    @Column({ type: 'float' })
    horas_catedra_semanales: number

    @Column()
    permite_multiples_docentes: boolean
    
    @Column({ type: 'integer', nullable: true })
    cantidad_maxima_docentes: number | null // opcional si permite_multiples_docentes es true, de lo contrario puede ser null


    @ManyToOne(() => StudyPlan, (studyPlan) => studyPlan.asignaturas, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'plan_estudio_id' })
    plan_estudio: StudyPlan;

    @RelationId((subject: Subject) => subject.plan_estudio)
    plan_estudio_id: number;
}
