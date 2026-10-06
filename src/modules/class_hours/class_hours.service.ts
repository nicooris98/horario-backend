import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick, requireInt, requireTimeOrder } from '../../common/helpers';
import { CreateClassHourDto } from './dto/create-class-hour.dto';
import { UpdateClassHourDto } from './dto/update-class-hour.dto';
import { ClassHour } from './entities/class_hour.entity';

const FIELDS = ['slotNumber', 'startTime', 'endTime'] as const;

@Injectable()
export class ClassHoursService {
  constructor(
    @InjectRepository(ClassHour)
    private readonly repository: Repository<ClassHour>,
  ) {}

  create(dto: CreateClassHourDto) {
    this.validate(dto);
    return this.repository.save(
      this.repository.create(pick(dto, [...FIELDS])),
    );
  }

  findAll() {
    return this.repository.find({ order: { slotNumber: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Class hour ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateClassHourDto) {
    const item = await this.findOne(id);
    Object.assign(item, pick(dto, [...FIELDS]));
    this.validate(item);
    return this.repository.save(item);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private validate(h: CreateClassHourDto) {
    requireInt(h.slotNumber, 'slotNumber');
    requireTimeOrder(h.startTime, h.endTime);
  }
}
