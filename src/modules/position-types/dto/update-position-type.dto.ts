import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionTypeDto } from './create-position-type.dto';

export class UpdatePositionTypeDto extends PartialType(CreatePositionTypeDto) {}
