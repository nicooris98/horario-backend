import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('horas_catedra')
export class ClassPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  startTime: string;

  @Column({ name: 'hora_fin', type: 'time' })
  endTime: string;

  @Column({ name: 'estado', default: true })
  status: boolean;
}
