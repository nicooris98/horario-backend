import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Profile } from '../../profiles/entities/profile.entity';

@Entity('profiles_premissions')
export class ProfilesPermission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	id_profile: number;

	@Column()
	id_premissions: number;

	@ManyToOne(() => Profile)
	@JoinColumn({ name: 'id_profile' })
	profile: Profile;

	@ManyToOne(() => Permission)
	@JoinColumn({ name: 'id_premissions' })
	permission: Permission;
}
