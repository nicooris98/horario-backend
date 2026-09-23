import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'integer' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 255 })
  apellido: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @ManyToOne(() => Role, (role) => role.usuarios, { nullable: false })
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];
}
