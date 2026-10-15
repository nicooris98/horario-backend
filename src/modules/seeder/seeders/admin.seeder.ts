import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { RoleName } from '../../../common/constants/roles';

export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);
    const userRepository = this.dataSource.getRepository(User);

    const adminRole = await this.ensureAdminRole(roleRepository);
    const adminUser = await this.ensureFirstUser(userRepository);

    const alreadyAssigned = (adminUser.roles ?? []).some(
      (role) => role.id === adminRole.id,
    );

    if (!alreadyAssigned) {
      adminUser.roles = [...(adminUser.roles ?? []), adminRole];
      await userRepository.save(adminUser);
      this.logger.log(
        `Rol ${RoleName.ADMIN} asignado al usuario ${adminUser.email}`,
      );
    }
  }

  private async ensureAdminRole(roleRepository: Repository<Role>) {
    const existing = await roleRepository.findOne({
      where: { name: RoleName.ADMIN },
    });

    if (existing) {
      return existing;
    }

    const saved = await roleRepository.save(
      roleRepository.create({
        name: RoleName.ADMIN,
        description: 'Administrador del sistema',
        isActive: true,
      }),
    );

    this.logger.log(`Rol ${RoleName.ADMIN} creado`);
    return saved;
  }

  private async ensureFirstUser(userRepository: Repository<User>) {
    const [firstUser] = await userRepository.find({
      relations: { roles: true },
      order: { id: 'ASC' },
      take: 1,
    });

    if (firstUser) {
      return firstUser;
    }

    const email = this.configService.get<string>(
      'SEED_ADMIN_EMAIL',
      'admin@horario.local',
    );
    const existingByEmail = await this.usersService.findOneByEmail(email, true);

    if (existingByEmail) {
      return existingByEmail;
    }

    const created = await this.usersService.create({
      first_name: this.configService.get<string>(
        'SEED_ADMIN_FIRST_NAME',
        'Admin',
      ),
      last_name: this.configService.get<string>(
        'SEED_ADMIN_LAST_NAME',
        'Sistema',
      ),
      email,
      password: this.configService.get<string>(
        'SEED_ADMIN_PASSWORD',
        'Admin1234',
      ),
    });

    this.logger.log(`Usuario administrador creado: ${created.email}`);

    return userRepository.findOneOrFail({
      where: { id: created.id },
      relations: { roles: true },
    });
  }
}
