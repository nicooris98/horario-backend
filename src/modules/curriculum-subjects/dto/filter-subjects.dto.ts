import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class FilterSubjectsDto {
  @ApiPropertyOptional({
    description: 'Filtrar las materias pertenecientes a un plan de estudio específico por su ID',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  studyPlanId?: number;
}

