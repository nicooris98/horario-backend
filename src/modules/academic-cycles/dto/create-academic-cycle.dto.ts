import { IsInt, Matches, Min } from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateAcademicCycleDto {
  @IsInt()
  @Min(1)
  year: number;

  @Matches(DATE, { message: 'startDate must use the YYYY-MM-DD format' })
  startDate: string;

  @Matches(DATE, { message: 'endDate must use the YYYY-MM-DD format' })
  endDate: string;
}
