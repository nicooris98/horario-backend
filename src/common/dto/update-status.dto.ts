import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsIn(['ACTIVO', 'INACTIVO'])
  status: 'ACTIVO' | 'INACTIVO';
}
