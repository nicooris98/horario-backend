import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Careers } from '../../careers/entities/careers.entity';

@Entity('study_plans')
export class StudyPlan {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	id_career: number;

	@Column()
	name: string;

	@Column()
	year_validity: number;

	@Column({ type: 'date' })
	date_since: Date;

	@Column({ type: 'date' })
	date_until: Date;

	@Column()
	status: boolean;

	@ManyToOne(() => Careers)
	@JoinColumn({ name: 'id_career' })
	career: Careers;
}
