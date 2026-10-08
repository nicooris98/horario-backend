import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('asignaturas')
export class Asignatura {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string
}
