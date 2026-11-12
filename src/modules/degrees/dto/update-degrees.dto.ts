import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNotEmpty } from 'class-validator';
import { CreateDegreeDto } from './create-degrees.dto';

export class UpdateDegreeDto extends PartialType(CreateDegreeDto) {}

export class UpdateDegreeStatusDto {
  @IsNotEmpty()
  @IsIn(['ACTIVO', 'INACTIVO'])
  status: 'ACTIVO' | 'INACTIVO';
}