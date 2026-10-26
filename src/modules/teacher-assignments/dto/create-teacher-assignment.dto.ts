import { IsInt, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateTeacherAssignmentDto {
  @IsInt()
  @Min(1)
  teacherId: number;

  @IsInt()
  @Min(1)
  positionTypeId: number;

  // Las suplencias lo heredan del titular y no hace falta mandarlo.
  @IsOptional()
  @IsInt()
  @Min(1)
  courseSectionSubjectId?: number;

  // Solo para suplencias.
  @IsOptional()
  @IsInt()
  @Min(1)
  replacedAssignmentId?: number | null;

  // Las suplencias lo heredan del titular y no hace falta mandarlo.
  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyHours?: number;

  @IsDateString({ strict: true })
  startDate: string;

  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string | null;
}