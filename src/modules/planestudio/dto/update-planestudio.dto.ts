import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanestudioDto } from './create-planestudio.dto';

export class UpdatePlanestudioDto extends PartialType(CreatePlanestudioDto) {}
