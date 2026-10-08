import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateDashboardUserDto extends CreateUserDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  role_ids?: number[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
