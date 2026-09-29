import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('careers')
export class Careers {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	years_quantity: number;
}
