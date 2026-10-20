import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ResendActivationCodeDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;
}
