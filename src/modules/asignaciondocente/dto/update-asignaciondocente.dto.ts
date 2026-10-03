import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignaciondocenteDto } from './create-asignaciondocente.dto';

export class UpdateAsignaciondocenteDto extends PartialType(CreateAsignaciondocenteDto) {}
