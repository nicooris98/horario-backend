import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { User } from './user.entity';
import { Perfil } from '../../perfiles/entities/perfil.entity';

@Entity('usuarios_perfil')
export class UserRole extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario_perfil', type: 'integer' })
  id: number;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user: User;

  @ManyToOne(() => Perfil, (perfil) => perfil.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_perfil' })
  perfil: Perfil;
}
