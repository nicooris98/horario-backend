import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAsignaturaDto {
  @ApiProperty({
    description: 'Nombre de la materia o espacio curricular',
    example: 'Programación Web',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description:
      'Año de cursado dentro del plan de estudio (no puede superar la duración en años del plan)',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  year: number;

  @ApiProperty({
    description: 'Identificador del régimen de cursado (ej. cuatrimestral, anual)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  regimeId: number;

  @ApiProperty({
    description: 'Cantidad de horas semanales dedicadas a la materia',
    example: 6,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  weeklyHours: number;

  @ApiProperty({
    description: 'Indica si la materia admite la asignación de múltiples docentes en simultáneo',
    example: false,
  })
  @IsBoolean()
  allowsMultipleTeachers: boolean;

  @ApiPropertyOptional({
    description:
      'Cantidad máxima de docentes permitidos. Solo aplica si allowsMultipleTeachers es true (mínimo 2). Si es false, se normaliza automáticamente a null.',
    example: null,
    nullable: true,
    minimum: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxTeachers?: number | null;

  @ApiProperty({
    description: 'Identificador del plan de estudio al que pertenece la materia',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  studyPlanId: number;
}
