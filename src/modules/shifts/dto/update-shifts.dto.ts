import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shifts.dto';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}
