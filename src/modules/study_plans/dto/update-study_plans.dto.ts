import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyPlanDto } from './create-study_plans.dto';

export class UpdateStudyPlanDto extends PartialType(CreateStudyPlanDto) {}
