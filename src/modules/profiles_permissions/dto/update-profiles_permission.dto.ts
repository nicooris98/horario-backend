import { PartialType } from '@nestjs/mapped-types';
import { CreateProfilesPermissionDto } from './create-profiles_permission.dto';

export class UpdateProfilesPermissionDto extends PartialType(CreateProfilesPermissionDto) {}
