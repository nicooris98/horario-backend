import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('dia')
export class Day {
  @PrimaryGeneratedColumn({ name: 'id_dia' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'lectivo', default: true })
  isSchoolDay: boolean;

  @OneToMany(() => Schedule, (schedule) => schedule.day)
  schedules: Schedule[];
}