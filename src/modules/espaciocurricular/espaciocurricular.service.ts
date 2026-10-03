import { Injectable } from '@nestjs/common';
import { CreateEspaciocurricularDto } from './dto/create-espaciocurricular.dto';
import { UpdateEspaciocurricularDto } from './dto/update-espaciocurricular.dto';

@Injectable()
export class EspaciocurricularService {
  create(createEspaciocurricularDto: CreateEspaciocurricularDto) {
    return 'This action adds a new espaciocurricular';
  }

  findAll() {
    return `This action returns all espaciocurricular`;
  }

  findOne(id: number) {
    return `This action returns a #${id} espaciocurricular`;
  }

  update(id: number, updateEspaciocurricularDto: UpdateEspaciocurricularDto) {
    return `This action updates a #${id} espaciocurricular`;
  }

  remove(id: number) {
    return `This action removes a #${id} espaciocurricular`;
  }
}
