import { Injectable } from '@nestjs/common';
import { CreatePlanestudioDto } from './dto/create-planestudio.dto';
import { UpdatePlanestudioDto } from './dto/update-planestudio.dto';

@Injectable()
export class PlanestudioService {
  create(createPlanestudioDto: CreatePlanestudioDto) {
    return 'This action adds a new planestudio';
  }

  findAll() {
    return `This action returns all planestudio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planestudio`;
  }

  update(id: number, updatePlanestudioDto: UpdatePlanestudioDto) {
    return `This action updates a #${id} planestudio`;
  }

  remove(id: number) {
    return `This action removes a #${id} planestudio`;
  }
}
