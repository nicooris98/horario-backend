import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission extends AuditEntity {
  @PrimaryGeneratedColumn({
    name: 'permission_id',
    type: 'integer',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  code: string; // ej: 'roles.create', 'users.read'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}