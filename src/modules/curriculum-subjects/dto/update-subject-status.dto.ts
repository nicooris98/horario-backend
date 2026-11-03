import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubjectStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la materia. Solo se admiten los valores ACTIVO o INACTIVO.',
    enum: ['ACTIVO', 'INACTIVO'],
    example: 'ACTIVO',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ACTIVO', 'INACTIVO'])
  status: string;
}

