import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsInt()
  @Min(1)
  number: number;

  @Matches(DATE, { message: 'startDate must use the YYYY-MM-DD format' })
  startDate: string;

  @Matches(DATE, { message: 'endDate must use the YYYY-MM-DD format' })
  endDate: string;
}
