import { DataSource } from 'typeorm';
import { AdminSeeder } from './seeders/admin.seeder';
import { RolesPermissionsSeeder } from './seeders/roles-permissions.seeder';

export class SeederService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly adminSeeder: AdminSeeder,
    private readonly rolesPermissionsSeeder: RolesPermissionsSeeder,
  ) {}

  async run(): Promise<void> {
    const adminConfiguration = this.adminSeeder.getConfiguration();

    await this.dataSource.transaction(async (manager) => {
      await this.rolesPermissionsSeeder.run(manager);
      await this.adminSeeder.run(manager, adminConfiguration);
    });
  }
}
