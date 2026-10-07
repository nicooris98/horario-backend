import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('docente')
export class Teacher {
  @PrimaryGeneratedColumn({ name: 'id_docente' })
  id: number;

  @Column({ name: 'dni' })
  dni: string;

  @Column({ name: 'nombre' })
  firstName: string;

  @Column({ name: 'apellido' })
  lastName: string;

  @Column({ name: 'telefono', type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string | null;

  @Column({ name: 'legajo', type: 'integer', nullable: true })
  fileNumber: number | null;

  @Column({ name: 'estado', default: 'ACTIVO' })
  status: string;
}
