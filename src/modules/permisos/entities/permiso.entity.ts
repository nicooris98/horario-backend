import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../../common/entities/audit.entity';
import { PerfilPermiso } from '../../perfiles/entities/perfil-permiso.entity';

@Entity('permisos')
export class Permiso extends AuditEntity {
  @PrimaryGeneratedColumn({ name: 'id_permiso', type: 'integer' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'codigo', type: 'varchar', length: 255, unique: true })
  codigo: string;

  @OneToMany(() => PerfilPermiso, (pp) => pp.permiso)
  perfilPermisos: PerfilPermiso[];
}
