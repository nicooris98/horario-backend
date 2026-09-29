import { Module } from '@nestjs/common';
import { ProfilesPermissionsService } from './profiles_permissions.service';
import { ProfilesPermissionsController } from './profiles_permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesPermission } from './entities/profiles_permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfilesPermission])],
  controllers: [ProfilesPermissionsController],
  providers: [ProfilesPermissionsService],
})
export class ProfilesPermissionsModule {}
