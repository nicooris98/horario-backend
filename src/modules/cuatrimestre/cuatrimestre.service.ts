import { Injectable } from '@nestjs/common';
import { CreateCuatrimestreDto } from './dto/create-cuatrimestre.dto';
import { UpdateCuatrimestreDto } from './dto/update-cuatrimestre.dto';

@Injectable()
export class CuatrimestreService {
  create(createCuatrimestreDto: CreateCuatrimestreDto) {
    return 'This action adds a new cuatrimestre';
  }

  findAll() {
    return `This action returns all cuatrimestre`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cuatrimestre`;
  }

  update(id: number, updateCuatrimestreDto: UpdateCuatrimestreDto) {
    return `This action updates a #${id} cuatrimestre`;
  }

  remove(id: number) {
    return `This action removes a #${id} cuatrimestre`;
  }
}
