import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { TEACHER_STATUSES } from '../constants/teachers.constants';

export class CreateTeacherDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[.\s]/g, '') : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7,8}$/)
  dni: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsString()
  phone?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @Type(() => Number)
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  fileNumber?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsIn(TEACHER_STATUSES)
  status?: string;
}
