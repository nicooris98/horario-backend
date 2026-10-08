import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User extends AuditEntity {
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'integer',
  })
  id: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  email: string;

  @Exclude()
  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'roles_users',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}