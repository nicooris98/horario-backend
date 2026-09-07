import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('asignaturas')
export class Subject {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string
}
