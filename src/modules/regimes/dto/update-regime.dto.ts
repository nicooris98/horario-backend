import { PartialType } from '@nestjs/mapped-types';
import { CreateRegimeDto } from './create-regime.dto';

export class UpdateRegimeDto extends PartialType(CreateRegimeDto) {}
