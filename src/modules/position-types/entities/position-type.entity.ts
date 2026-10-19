import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_cargo')
export class PositionType {
  @PrimaryGeneratedColumn({ name: 'id_tipo_cargo' })
  id: number;

  @Column({ name: 'nombre' })
  name: string;

  @Column({ name: 'descripcion', type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'admite_suplente', type: 'boolean' })
  allowsSubstitute: boolean;

  @Column({ name: 'estado' })
  status: string;
}
