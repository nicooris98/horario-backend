import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateCourseSectionDto {
  @IsInt()
  @Min(1)
  studyPlanAcademicCycleId: number;

  @IsInt()
  @Min(1)
  courseYear: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  section: string;
}
