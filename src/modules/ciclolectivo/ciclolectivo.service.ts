import { Injectable } from '@nestjs/common';
import { CreateCiclolectivoDto } from './dto/create-ciclolectivo.dto';
import { UpdateCiclolectivoDto } from './dto/update-ciclolectivo.dto';

@Injectable()
export class CiclolectivoService {
  create(createCiclolectivoDto: CreateCiclolectivoDto) {
    return 'This action adds a new ciclolectivo';
  }

  findAll() {
    return `This action returns all ciclolectivo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ciclolectivo`;
  }

  update(id: number, updateCiclolectivoDto: UpdateCiclolectivoDto) {
    return `This action updates a #${id} ciclolectivo`;
  }

  remove(id: number) {
    return `This action removes a #${id} ciclolectivo`;
  }
}
