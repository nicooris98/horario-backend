import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { Perfil } from './perfil.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';

@Entity('perfil_permiso')
export class PerfilPermiso extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_perfil_permiso', type: 'integer' })
  id: number;

  @ManyToOne(() => Perfil, (perfil) => perfil.perfilPermisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_perfil' })
  perfil: Perfil;

  @ManyToOne(() => Permiso, (permiso) => permiso.perfilPermisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_permiso' })
  permiso: Permiso;
}
