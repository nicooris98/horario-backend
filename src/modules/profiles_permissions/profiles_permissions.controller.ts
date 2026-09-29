import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfilesPermissionsService } from './profiles_permissions.service';
import { CreateProfilesPermissionDto } from './dto/create-profiles_permission.dto';
import { UpdateProfilesPermissionDto } from './dto/update-profiles_permission.dto';

@Controller('profiles-permissions')
export class ProfilesPermissionsController {
  constructor(private readonly profilesPermissionsService: ProfilesPermissionsService) {}

  @Post()
  create(@Body() createProfilesPermissionDto: CreateProfilesPermissionDto) {
    return this.profilesPermissionsService.create(createProfilesPermissionDto);
  }

  @Get()
  findAll() {
    return this.profilesPermissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesPermissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfilesPermissionDto: UpdateProfilesPermissionDto) {
    return this.profilesPermissionsService.update(+id, updateProfilesPermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profilesPermissionsService.remove(+id);
  }
}
