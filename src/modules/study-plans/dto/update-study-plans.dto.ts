import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyPlanDto } from './create-study-plans.dto';

export class UpdateStudyPlanDto extends PartialType(CreateStudyPlanDto) {}
