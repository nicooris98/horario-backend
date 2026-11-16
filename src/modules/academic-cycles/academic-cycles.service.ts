import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  deactivate,
  pick,
  requireDateOrder,
  requireInt,
} from '../../common/helpers';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { AcademicCycle } from './entities/academic-cycle.entity';

@Injectable()
export class AcademicCyclesService {
  constructor(
    @InjectRepository(AcademicCycle)
    private readonly repository: Repository<AcademicCycle>,
  ) {}

  create(dto: CreateAcademicCycleDto) {
    this.validate(dto.year, dto.startDate, dto.endDate);
    return this.repository.save(
      this.repository.create({
        ...pick(dto, ['year', 'startDate', 'endDate']),
        status: 'ACTIVO',
      }),
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
    Object.assign(item, pick(dto, ['year', 'startDate', 'endDate']));
    this.validate(item.year, item.startDate, item.endDate);
    return this.repository.save(item);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const item = await this.findOne(id);
    item.status = dto.status;
    return this.repository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repository.save(
      deactivate(item, 'El ciclo lectivo ya se encuentra inactivo'),
    );
  }

  private validate(year: number, startDate: string, endDate: string) {
    requireInt(year, 'year');
    requireDateOrder(startDate, endDate, 'startDate', 'endDate');
  }
}
