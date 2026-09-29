import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyPlanDto } from './create-study_plan.dto';

export class UpdateStudyPlanDto extends PartialType(CreateStudyPlanDto) {}
