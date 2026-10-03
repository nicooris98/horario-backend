import { PartialType } from '@nestjs/mapped-types';
import { CreateRegimanDto } from './create-regiman.dto';

export class UpdateRegimanDto extends PartialType(CreateRegimanDto) {}
