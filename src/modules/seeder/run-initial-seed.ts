import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { UsersService } from '../users/users.service';
import { AdminSeeder } from './seeders/admin.seeder';
import { RolesPermissionsSeeder } from './seeders/roles-permissions.seeder';
import { SeederService } from './seeder.service';

async function runInitialSeed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const adminSeeder = new AdminSeeder(
      app.get(UsersService),
      app.get(ConfigService),
    );
    const seedService = new SeederService(
      app.get(DataSource),
      adminSeeder,
      new RolesPermissionsSeeder(),
    );

    await seedService.run();
  } finally {
    await app.close();
  }
}

runInitialSeed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Initial data seeding failed: ${message}`);
  process.exitCode = 1;
});
