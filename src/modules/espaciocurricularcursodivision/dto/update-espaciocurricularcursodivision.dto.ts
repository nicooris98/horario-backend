import { PartialType } from '@nestjs/mapped-types';
import { CreateEspaciocurricularcursodivisionDto } from './create-espaciocurricularcursodivision.dto';

export class UpdateEspaciocurricularcursodivisionDto extends PartialType(CreateEspaciocurricularcursodivisionDto) {}
