import { PartialType } from '@nestjs/mapped-types';
import { CreateCareersDto } from './create-careers.dto';

export class UpdateCareersDto extends PartialType(CreateCareersDto) {}
