import { PartialType } from '@nestjs/mapped-types';
import { CreateCursodivisionDto } from './create-cursodivision.dto';

export class UpdateCursodivisionDto extends PartialType(CreateCursodivisionDto) {}
