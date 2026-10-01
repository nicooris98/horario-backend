import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';

@Entity('users')
export class User extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'integer' })
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  last_name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
