import { Injectable } from '@nestjs/common';
import { CreateCareersDto } from './dto/create-careers.dto';
import { UpdateCareersDto } from './dto/update-careers.dto';

@Injectable()
export class CareersService {
  create(createCareersDto: CreateCareersDto) {
    return 'This action adds a new careers';
  }

  findAll() {
    return `This action returns all careers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} careers`;
  }

  update(id: number, updateCareersDto: UpdateCareersDto) {
    return `This action updates a #${id} careers`;
  }

  remove(id: number) {
    return `This action removes a #${id} careers`;
  }
}
