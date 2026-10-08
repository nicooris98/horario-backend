import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicCycleDto } from './create-academic-cycle.dto';

export class UpdateAcademicCycleDto extends PartialType(CreateAcademicCycleDto) {}
