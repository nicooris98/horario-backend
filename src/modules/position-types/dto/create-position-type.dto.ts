import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { POSITION_TYPE_STATUSES } from '../constants/position-types.constants';

export class CreatePositionTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  allowsSubstitute?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : (value as string),
  )
  @IsIn(POSITION_TYPE_STATUSES)
  status?: string;
}
