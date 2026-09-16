import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassPeriodDto } from './dto/create-class-period.dto';
import { UpdateClassPeriodDto } from './dto/update-class-period.dto';
import { ClassPeriod } from './entities/class_period.entity';

@Injectable()
export class ClassPeriodsService {
  constructor(@InjectRepository(ClassPeriod) private readonly repository: Repository<ClassPeriod>) {}

  create(dto: CreateClassPeriodDto) { return this.repository.save(this.repository.create({ ...dto, status: dto.status ?? true })); }
  findAll() { return this.repository.find({ order: { startTime: 'ASC' } }); }
  async findOne(id: number) { const item = await this.repository.findOneBy({ id }); if (!item) throw new NotFoundException('Class period not found'); return item; }
  async update(id: number, dto: UpdateClassPeriodDto) { const item = await this.findOne(id); Object.assign(item, dto); return this.repository.save(item); }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }
}
