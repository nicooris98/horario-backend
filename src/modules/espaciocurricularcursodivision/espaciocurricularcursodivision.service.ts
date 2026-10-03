import { Injectable } from '@nestjs/common';
import { CreateEspaciocurricularcursodivisionDto } from './dto/create-espaciocurricularcursodivision.dto';
import { UpdateEspaciocurricularcursodivisionDto } from './dto/update-espaciocurricularcursodivision.dto';

@Injectable()
export class EspaciocurricularcursodivisionService {
  create(createEspaciocurricularcursodivisionDto: CreateEspaciocurricularcursodivisionDto) {
    return 'This action adds a new espaciocurricularcursodivision';
  }

  findAll() {
    return `This action returns all espaciocurricularcursodivision`;
  }

  findOne(id: number) {
    return `This action returns a #${id} espaciocurricularcursodivision`;
  }

  update(id: number, updateEspaciocurricularcursodivisionDto: UpdateEspaciocurricularcursodivisionDto) {
    return `This action updates a #${id} espaciocurricularcursodivision`;
  }

  remove(id: number) {
    return `This action removes a #${id} espaciocurricularcursodivision`;
  }
}
