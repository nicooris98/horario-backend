import { PartialType } from '@nestjs/mapped-types';
import { CreateEspaciocurricularDto } from './create-espaciocurricular.dto';

export class UpdateEspaciocurricularDto extends PartialType(CreateEspaciocurricularDto) {}
