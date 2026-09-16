import { PartialType } from '@nestjs/mapped-types';
import { CreateClassPeriodDto } from './create-class-period.dto';

export class UpdateClassPeriodDto extends PartialType(CreateClassPeriodDto) {}
