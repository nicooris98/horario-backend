import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('carreras')
export class Degree {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ default: true })
    estado: boolean;
}
