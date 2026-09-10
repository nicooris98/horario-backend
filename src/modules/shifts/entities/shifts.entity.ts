import {
    Column,
    Entity,
  Index,
  OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { StudyPlanShift } from '../../study_plan_shifts/entities/study_plan_shift.entity';

@Entity('turnos')
@Index('UQ_turnos_nombre', ['nombre'], { unique: true })
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ default: true })
  estado: boolean;

  @OneToMany(() => StudyPlanShift, (studyPlanShift) => studyPlanShift.turno)
  planes_estudio: StudyPlanShift[];
}