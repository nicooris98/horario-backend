import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TEACHER_STATUSES } from '../constants/teachers.constants';

export class CreateTeacherDto {
  // Acepta el DNI con o sin puntos; el formato final lo valida el servicio.
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  // El servicio exige al menos un medio de contacto (phone o email).
  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  fileNumber?: number | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : (value as string),
  )
  @IsIn(TEACHER_STATUSES)
  status?: string;
}
