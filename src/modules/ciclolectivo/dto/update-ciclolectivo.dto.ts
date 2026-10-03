import { PartialType } from '@nestjs/mapped-types';
import { CreateCiclolectivoDto } from './create-ciclolectivo.dto';

export class UpdateCiclolectivoDto extends PartialType(CreateCiclolectivoDto) {}
