import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cuatrimestre')
export class Semester {
  @PrimaryGeneratedColumn({ name: 'id_cuatrimestre' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'numero', type: 'integer' })
  number: number;

  @Column({ name: 'fecha_desde', type: 'date' })
  startDate: string;

  @Column({ name: 'fecha_hasta', type: 'date' })
  endDate: string;
}
