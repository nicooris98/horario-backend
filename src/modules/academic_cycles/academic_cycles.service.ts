import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  optionalStatus,
  pick,
  requireDateOrder,
  requireInt,
} from '../../common/helpers';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { AcademicCycle } from './entities/academic_cycle.entity';

@Injectable()
export class AcademicCyclesService {
  constructor(
    @InjectRepository(AcademicCycle)
    private readonly repository: Repository<AcademicCycle>,
  ) {}

  create(dto: CreateAcademicCycleDto) {
    this.validate(dto.year, dto.startDate, dto.endDate, dto.status);
    return this.repository.save(
      this.repository.create(
        pick(dto, ['year', 'startDate', 'endDate', 'status']),
      ),
    );
  }

  findAll() {
    return this.repository.find({ order: { year: 'DESC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException('Academic cycle not found');
    return item;
  }

  async update(id: number, dto: UpdateAcademicCycleDto) {
    const item = await this.findOne(id);
    Object.assign(item, pick(dto, ['year', 'startDate', 'endDate', 'status']));
    this.validate(item.year, item.startDate, item.endDate, item.status);
    return this.repository.save(item);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private validate(
    year: number,
    startDate: string,
    endDate: string,
    status?: string,
  ) {
    requireInt(year, 'year');
    requireDateOrder(startDate, endDate, 'startDate', 'endDate');
    optionalStatus(status);
  }
}
