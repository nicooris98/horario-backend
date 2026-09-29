import { Injectable } from '@nestjs/common';
import { CreateProfilesPermissionDto } from './dto/create-profiles_permission.dto';
import { UpdateProfilesPermissionDto } from './dto/update-profiles_permission.dto';

@Injectable()
export class ProfilesPermissionsService {
  create(createProfilesPermissionDto: CreateProfilesPermissionDto) {
    return 'This action adds a new profilesPermission';
  }

  findAll() {
    return `This action returns all profilesPermissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profilesPermission`;
  }

  update(id: number, updateProfilesPermissionDto: UpdateProfilesPermissionDto) {
    return `This action updates a #${id} profilesPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} profilesPermission`;
  }
}
