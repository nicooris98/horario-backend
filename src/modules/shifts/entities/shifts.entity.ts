import {
    Column,
    Entity,
  Index,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity('turnos')
@Index('UQ_turnos_nombre', ['nombre'], { unique: true })
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: true })
  activo: boolean;
}