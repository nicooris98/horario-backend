import { PartialType } from '@nestjs/mapped-types';
import { CreateClassHourDto } from './create-class-hour.dto';

export class UpdateClassHourDto extends PartialType(CreateClassHourDto) {}
