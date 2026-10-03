import { Injectable } from '@nestjs/common';
import { CreateCursodivisionDto } from './dto/create-cursodivision.dto';
import { UpdateCursodivisionDto } from './dto/update-cursodivision.dto';

@Injectable()
export class CursodivisionService {
  create(createCursodivisionDto: CreateCursodivisionDto) {
    return 'This action adds a new cursodivision';
  }

  findAll() {
    return `This action returns all cursodivision`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cursodivision`;
  }

  update(id: number, updateCursodivisionDto: UpdateCursodivisionDto) {
    return `This action updates a #${id} cursodivision`;
  }

  remove(id: number) {
    return `This action removes a #${id} cursodivision`;
  }
}
