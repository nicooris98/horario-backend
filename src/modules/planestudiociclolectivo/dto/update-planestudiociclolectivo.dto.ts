import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanestudiociclolectivoDto } from './create-planestudiociclolectivo.dto';

export class UpdatePlanestudiociclolectivoDto extends PartialType(CreatePlanestudiociclolectivoDto) {}
