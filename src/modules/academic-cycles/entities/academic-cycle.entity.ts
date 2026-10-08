import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudyPlanAcademicCycle } from '../../study-plan-academic-cycles/entities/study-plan-academic-cycle.entity';

@Entity('ciclo_lectivo')
export class AcademicCycle {
  @PrimaryGeneratedColumn({ name: 'id_ciclo_lectivo' })
  id: number;

  @Column({ name: 'anio', type: 'integer' })
  year: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  startDate: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  endDate: string;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;

  @OneToMany(() => StudyPlanAcademicCycle, (spc) => spc.academicCycle)
  studyPlanAcademicCycles: StudyPlanAcademicCycle[];
}
