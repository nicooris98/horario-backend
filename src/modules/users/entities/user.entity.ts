import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
        id: number
    
        @Column({
            name: 'nombre'
        })
        name: string


        @Column({
            name: 'apellido'
        })
        lastname: string


        @Column({
            name: 'correo'
        })
        email: string



        @Column({
            name: 'password'
        })
        password: string
}
