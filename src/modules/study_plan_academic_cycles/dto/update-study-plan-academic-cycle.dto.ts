import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyPlanAcademicCycleDto } from './create-study-plan-academic-cycle.dto';

export class UpdateStudyPlanAcademicCycleDto extends PartialType(
  CreateStudyPlanAcademicCycleDto,
) {}
