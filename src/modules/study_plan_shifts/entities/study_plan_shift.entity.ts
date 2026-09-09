import {
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import { StudyPlan } from '../../study_plans/entities/study_plans.entity';
import { Shift } from '../../shifts/entities/shifts.entity';


@Entity('plan_estudio_turnos')
@Index('UQ_plan_estudio_turno', ['plan_estudio', 'turno'], { unique: true })
@Index('IDX_plan_estudio_turno_turno_id', ['turno'])
export class StudyPlanShift {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => StudyPlan, (studyPlan) => studyPlan.planes_estudio, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'plan_estudio_id' })
    plan_estudio: StudyPlan;

    @RelationId((studyPlanShift: StudyPlanShift) => studyPlanShift.plan_estudio)
    plan_estudio_id: number;

    @ManyToOne(() => Shift, (shift) => shift.planes_estudio, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'turno_id' })
    turno: Shift;

    @RelationId((studyPlanShift: StudyPlanShift) => studyPlanShift.turno)
    turno_id: number;
}
