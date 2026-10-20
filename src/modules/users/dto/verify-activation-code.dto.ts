import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifyActivationCodeDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/)
  code: string;
}
