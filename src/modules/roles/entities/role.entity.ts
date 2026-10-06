import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';

@Entity('roles')
export class Role extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_role', type: 'integer' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'estado', type: 'boolean', default: true })
  estado: boolean;
}
