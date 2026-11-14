import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  deactivate,
  pick,
  requireText,
  requireTimeOrder,
} from '../../common/helpers';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Shift } from './entities/shift.entity';

const FIELDS = ['name', 'startTime', 'endTime'] as const;

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private readonly repository: Repository<Shift>,
  ) {}

  create(dto: CreateShiftDto) {
    this.validate(dto);
    return this.repository.save(
      this.repository.create({
        ...pick(dto, [...FIELDS]),
        name: dto.name.trim(),
        status: 'ACTIVO',
      }),
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

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const item = await this.findOne(id);
    item.status = dto.status;
    return this.repository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repository.save(
      deactivate(item, 'El turno ya se encuentra inactivo'),
    );
  }

  private validate(s: CreateShiftDto) {
    requireText(s.name, 'name');
    requireTimeOrder(s.startTime, s.endTime);
  }
}
