import { IsInt, IsDateString, IsOptional, IsString, Min, IsNumber } from 'class-validator';

export class CreateStudyPlanDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  degreeId: number;

  @IsNumber()
  @Min(1)
  durationYears: number;

  @IsInt()
  @Min(2000)
  validityYear: number;

  @IsDateString({ strict: true })
  startDate: string;

  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string | null;

  @IsOptional()
  @IsString()
  status?: string;
}