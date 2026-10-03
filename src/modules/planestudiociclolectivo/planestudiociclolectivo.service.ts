import { Injectable } from '@nestjs/common';
import { CreatePlanestudiociclolectivoDto } from './dto/create-planestudiociclolectivo.dto';
import { UpdatePlanestudiociclolectivoDto } from './dto/update-planestudiociclolectivo.dto';

@Injectable()
export class PlanestudiociclolectivoService {
  create(createPlanestudiociclolectivoDto: CreatePlanestudiociclolectivoDto) {
    return 'This action adds a new planestudiociclolectivo';
  }

  findAll() {
    return `This action returns all planestudiociclolectivo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planestudiociclolectivo`;
  }

  update(id: number, updatePlanestudiociclolectivoDto: UpdatePlanestudiociclolectivoDto) {
    return `This action updates a #${id} planestudiociclolectivo`;
  }

  remove(id: number) {
    return `This action removes a #${id} planestudiociclolectivo`;
  }
}
