import { Injectable } from '@nestjs/common';
import { CreateTipocargoDto } from './dto/create-tipocargo.dto';
import { UpdateTipocargoDto } from './dto/update-tipocargo.dto';

@Injectable()
export class TipocargoService {
  create(createTipocargoDto: CreateTipocargoDto) {
    return 'This action adds a new tipocargo';
  }

  findAll() {
    return `This action returns all tipocargo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipocargo`;
  }

  update(id: number, updateTipocargoDto: UpdateTipocargoDto) {
    return `This action updates a #${id} tipocargo`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipocargo`;
  }
}
