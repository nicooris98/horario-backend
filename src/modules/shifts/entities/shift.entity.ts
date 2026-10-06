import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudyPlanAcademicCycle } from '../../study_plan_academic_cycles/entities/study_plan_academic_cycle.entity';

@Entity('turno')
export class Shift {
  @PrimaryGeneratedColumn({ name: 'id_turno' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  startTime: string;

  @Column({ name: 'hora_fin', type: 'time' })
  endTime: string;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;

  @OneToMany(() => StudyPlanAcademicCycle, (spc) => spc.shift)
  studyPlanAcademicCycles: StudyPlanAcademicCycle[];
}
