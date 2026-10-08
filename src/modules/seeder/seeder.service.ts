import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { AdminSeeder } from './seeders/admin.seeder';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminSeeder = new AdminSeeder(
      this.dataSource,
      this.usersService,
      this.configService,
    );

    await adminSeeder.run();
  }
}
