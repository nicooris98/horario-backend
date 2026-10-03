import { Injectable } from '@nestjs/common';
import { CreateRegimanDto } from './dto/create-regiman.dto';
import { UpdateRegimanDto } from './dto/update-regiman.dto';

@Injectable()
export class RegimenService {
  create(createRegimanDto: CreateRegimanDto) {
    return 'This action adds a new regiman';
  }

  findAll() {
    return `This action returns all regimen`;
  }

  findOne(id: number) {
    return `This action returns a #${id} regiman`;
  }

  update(id: number, updateRegimanDto: UpdateRegimanDto) {
    return `This action updates a #${id} regiman`;
  }

  remove(id: number) {
    return `This action removes a #${id} regiman`;
  }
}
