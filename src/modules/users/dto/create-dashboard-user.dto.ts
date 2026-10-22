import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class CreateDashboardUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  role_ids?: number[];
}
