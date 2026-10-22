import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  optionalStatus,
  pick,
  requireText,
  requireTimeOrder,
} from '../../common/helpers';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Shift } from './entities/shift.entity';

const FIELDS = ['name', 'startTime', 'endTime', 'status'] as const;

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private readonly repository: Repository<Shift>,
  ) {}

  create(dto: CreateShiftDto) {
    this.validate(dto);
    return this.repository.save(
      this.repository.create({ ...pick(dto, [...FIELDS]), name: dto.name.trim() }),
    );
  }

  findAll() {
    return this.repository.find({ order: { startTime: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Shift ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateShiftDto) {
    const item = await this.findOne(id);
    Object.assign(item, pick(dto, [...FIELDS]));
    this.validate(item);
    item.name = item.name.trim();
    return this.repository.save(item);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private validate(s: CreateShiftDto) {
    requireText(s.name, 'name');
    requireTimeOrder(s.startTime, s.endTime);
    optionalStatus(s.status);
  }
}
