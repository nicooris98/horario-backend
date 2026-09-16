import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { AcademicCycle } from './entities/academic_cycle.entity';

@Injectable()
export class AcademicCyclesService {
  constructor(@InjectRepository(AcademicCycle) private readonly repository: Repository<AcademicCycle>) {}

  create(dto: CreateAcademicCycleDto) { return this.repository.save(this.repository.create({ ...dto, status: dto.status ?? true })); }
  findAll() { return this.repository.find({ order: { year: 'DESC' } }); }
  async findOne(id: number) { const item = await this.repository.findOneBy({ id }); if (!item) throw new NotFoundException('Academic cycle not found'); return item; }
  async update(id: number, dto: UpdateAcademicCycleDto) { const item = await this.findOne(id); Object.assign(item, dto); return this.repository.save(item); }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }
}
