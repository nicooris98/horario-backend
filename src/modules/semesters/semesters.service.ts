import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  pick,
  requireDateOrder,
  requireInt,
  requireText,
} from '../../common/helpers';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Semester } from './entities/semester.entity';

const FIELDS = ['name', 'number', 'startDate', 'endDate'] as const;

@Injectable()
export class SemestersService {
  constructor(
    @InjectRepository(Semester)
    private readonly repository: Repository<Semester>,
  ) {}

  create(dto: CreateSemesterDto) {
    this.validate(dto);
    return this.repository.save(
      this.repository.create({ ...pick(dto, [...FIELDS]), name: dto.name.trim() }),
    );
  }

  findAll() {
    return this.repository.find({ order: { startDate: 'DESC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Semester ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateSemesterDto) {
    const item = await this.findOne(id);
    Object.assign(item, pick(dto, [...FIELDS]));
    this.validate(item);
    item.name = item.name.trim();
    return this.repository.save(item);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private validate(s: CreateSemesterDto) {
    requireText(s.name, 'name');
    requireInt(s.number, 'number');
    requireDateOrder(s.startDate, s.endDate, 'startDate', 'endDate');
  }
}
