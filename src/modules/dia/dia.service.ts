import { Injectable } from '@nestjs/common';
import { CreateDiaDto } from './dto/create-dia.dto';
import { UpdateDiaDto } from './dto/update-dia.dto';

@Injectable()
export class DiaService {
  create(createDiaDto: CreateDiaDto) {
    return 'This action adds a new dia';
  }

  findAll() {
    return `This action returns all dia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dia`;
  }

  update(id: number, updateDiaDto: UpdateDiaDto) {
    return `This action updates a #${id} dia`;
  }

  remove(id: number) {
    return `This action removes a #${id} dia`;
  }
}
