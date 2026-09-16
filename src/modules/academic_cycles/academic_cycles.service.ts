import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { AcademicCycle } from './entities/academic_cycle.entity';

@Injectable()
export class AcademicCyclesService {
  constructor(@InjectRepository(AcademicCycle) private readonly repository: Repository<AcademicCycle>) {}

  create(dto: CreateAcademicCycleDto) {
    this.validate(dto.year, dto.startDate, dto.endDate, dto.status);
    return this.repository.save(this.repository.create({ ...dto, status: dto.status ?? true }));
  }
  findAll() { return this.repository.find({ order: { year: 'DESC' } }); }
  async findOne(id: number) { const item = await this.repository.findOneBy({ id }); if (!item) throw new NotFoundException('Academic cycle not found'); return item; }
  async update(id: number, dto: UpdateAcademicCycleDto) {
    const item = await this.findOne(id);
    const year = dto.year ?? item.year;
    const startDate = dto.startDate ?? item.startDate;
    const endDate = dto.endDate ?? item.endDate;
    this.validate(year, startDate, endDate, dto.status);
    Object.assign(item, dto);
    return this.repository.save(item);
  }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }

  private validate(year: number, startDate: string, endDate: string, status?: boolean) {
    if (!Number.isInteger(year) || year <= 0) {
      throw new BadRequestException('year must be a positive integer');
    }

    const start = this.parseDate(startDate, 'startDate');
    const end = this.parseDate(endDate, 'endDate');
    if (end < start) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    if (status !== undefined && typeof status !== 'boolean') {
      throw new BadRequestException('status must be boolean');
    }
  }

  private parseDate(value: string, field: string) {
    const date = new Date(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must use the YYYY-MM-DD format`);
    }
    return date;
  }
}
