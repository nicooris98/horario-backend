import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { PerfilPermiso } from './perfil-permiso.entity';

@Entity('perfiles')
export class Perfil extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_perfil', type: 'integer' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;

  @OneToMany(() => UserRole, (ur) => ur.perfil)
  userRoles: UserRole[];

  @OneToMany(() => PerfilPermiso, (pp) => pp.perfil)
  perfilPermisos: PerfilPermiso[];
}
