import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('docente')
export class Docente {
  @PrimaryGeneratedColumn({
    name: 'id_docente',
    type: 'integer',
  })
  id: number;

  @Column({
    name: 'dni',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  dni: string;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    name: 'apellido',
    type: 'varchar',
    length: 100,
  })
  apellido: string;

  @Column({
    name: 'telefono',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  email: string;

  @Column({
    name: 'legajo',
    type: 'integer',
    nullable: true,
  })
  legajo: number;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    default: 'activo',
  })
  estado: string;
}

