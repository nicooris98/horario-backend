import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Subject } from '../../curriculum_subjects/entities/subject.entity';

@Entity('regimen')
export class Regime {
  @PrimaryGeneratedColumn({ name: 'id_regimen' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @OneToMany(() => Subject, (subject) => subject.regime)
  subjects: Subject[];
}
