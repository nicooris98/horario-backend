import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { Perfil } from '../../perfiles/entities/perfil.entity';

@Entity('usuarios_perfil')
export class UserRole extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario_perfil', type: 'integer' })
  id: number;

  @Column({ name: 'id_usuario', type: 'integer' })
  userId: number;

  @ManyToOne(() => Perfil, (perfil) => perfil.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_perfil' })
  perfil: Perfil;
}
