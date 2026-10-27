import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';
import { EntityManager } from 'typeorm';
import { UsersService } from '../../users/users.service';

export interface AdminSeedConfiguration {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  getConfiguration(): AdminSeedConfiguration {
    const email = this.configService.get<string>('SEED_ADMIN_EMAIL')?.trim();

    if (!email || !isEmail(email)) {
      throw new Error('SEED_ADMIN_EMAIL must be a valid email address');
    }

    return {
      email: email.toLowerCase(),
      firstName:
        this.configService.get<string>('SEED_ADMIN_FIRST_NAME')?.trim() ||
        'Admin',
      lastName:
        this.configService.get<string>('SEED_ADMIN_LAST_NAME')?.trim() ||
        'Sistema',
    };
  }

  async run(
    manager: EntityManager,
    configuration: AdminSeedConfiguration,
  ): Promise<void> {
    const result = await this.usersService.ensureConfiguredAdmin(
      manager,
      configuration,
    );

    this.logger.log(
      result.created
        ? 'Initial administrator account created and assigned the admin role'
        : result.roleAssigned
          ? 'Admin role assigned to the explicitly configured account'
          : 'Configured administrator account already has the admin role',
    );
  }
}
