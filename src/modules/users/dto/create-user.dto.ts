import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
