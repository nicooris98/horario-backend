import { PartialType } from '@nestjs/mapped-types';
import { CreateDegreeDto } from './create-degrees.dto';

export class UpdateDegreeDto extends PartialType(CreateDegreeDto) {}
