import { PartialType } from '@nestjs/mapped-types';
import { CreateTipocargoDto } from './create-tipocargo.dto';

export class UpdateTipocargoDto extends PartialType(CreateTipocargoDto) {}
