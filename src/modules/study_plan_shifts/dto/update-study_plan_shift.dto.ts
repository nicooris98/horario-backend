import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyPlanShiftDto } from './create-study_plan_shift.dto';

export class UpdateStudyPlanShiftDto extends PartialType(CreateStudyPlanShiftDto) {}
