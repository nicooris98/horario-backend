import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDegreeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
