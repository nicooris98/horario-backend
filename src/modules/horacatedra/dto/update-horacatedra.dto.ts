import { PartialType } from '@nestjs/mapped-types';
import { CreateHoracatedraDto } from './create-horacatedra.dto';

export class UpdateHoracatedraDto extends PartialType(CreateHoracatedraDto) {}
