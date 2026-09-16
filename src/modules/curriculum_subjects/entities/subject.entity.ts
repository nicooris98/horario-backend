import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';

@Entity('espacios_curriculares')
@Index('UQ_espacios_curriculares_plan_nombre', ['studyPlan', 'name'], {
    unique: true,
})
export class Subject {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'nombre' })
    name: string

    @Column({ name: 'anio_cursado', type: 'integer' })
    year: number

    @Column({ name: 'regimen' })
    regime: string

    @Column({ name: 'horas_semanales', type: 'integer' })
    weeklyHours: number

    @Column({ name: 'permite_multiples_docentes' })
    allowsMultipleTeachers: boolean

    @Column({ name: 'max_docentes', type: 'integer', nullable: true })
    maxTeachers: number | null

    @Column({ name: 'estado', default: true })
    status: boolean


    @ManyToOne(() => StudyPlan, (studyPlan) => studyPlan.curriculumSubjects, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'id_plan' })
    studyPlan: StudyPlan;

    @RelationId((subject: Subject) => subject.studyPlan)
    studyPlanId: number;
}
