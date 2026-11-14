import { IsInt, Min } from 'class-validator';

export class CreateStudyPlanAcademicCycleDto {
  @IsInt()
  @Min(1)
  studyPlanId: number;

  @IsInt()
  @Min(1)
  academicCycleId: number;

  @IsInt()
  @Min(1)
  shiftId: number;
}
