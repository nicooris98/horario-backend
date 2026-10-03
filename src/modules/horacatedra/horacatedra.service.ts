import { Injectable } from '@nestjs/common';
import { CreateHoracatedraDto } from './dto/create-horacatedra.dto';
import { UpdateHoracatedraDto } from './dto/update-horacatedra.dto';

@Injectable()
export class HoracatedraService {
  create(createHoracatedraDto: CreateHoracatedraDto) {
    return 'This action adds a new horacatedra';
  }

  findAll() {
    return `This action returns all horacatedra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} horacatedra`;
  }

  update(id: number, updateHoracatedraDto: UpdateHoracatedraDto) {
    return `This action updates a #${id} horacatedra`;
  }

  remove(id: number) {
    return `This action removes a #${id} horacatedra`;
  }
}
