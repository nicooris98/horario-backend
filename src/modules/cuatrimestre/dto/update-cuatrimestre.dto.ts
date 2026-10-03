import { PartialType } from '@nestjs/mapped-types';
import { CreateCuatrimestreDto } from './create-cuatrimestre.dto';

export class UpdateCuatrimestreDto extends PartialType(CreateCuatrimestreDto) {}
