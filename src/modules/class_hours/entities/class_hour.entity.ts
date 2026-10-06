import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hora_catedra')
export class ClassHour {
  @PrimaryGeneratedColumn({ name: 'id_hora_catedra' })
  id: number;

  @Column({ name: 'numero_franja', type: 'integer' })
  slotNumber: number;

  @Column({ name: 'hora_desde', type: 'time' })
  startTime: string;

  @Column({ name: 'hora_hasta', type: 'time' })
  endTime: string;
}
