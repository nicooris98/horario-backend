import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassPeriodDto } from './dto/create-class-period.dto';
import { UpdateClassPeriodDto } from './dto/update-class-period.dto';
import { ClassPeriod } from './entities/class_period.entity';

@Injectable()
export class ClassPeriodsService {
  constructor(@InjectRepository(ClassPeriod) private readonly repository: Repository<ClassPeriod>) {}

  create(dto: CreateClassPeriodDto) {
    this.validate(dto.name, dto.startTime, dto.endTime, dto.status);
    return this.repository.save(this.repository.create({
      ...dto,
      name: dto.name.trim(),
      status: dto.status ?? true,
    }));
  }
  findAll() { return this.repository.find({ order: { startTime: 'ASC' } }); }
  async findOne(id: number) { const item = await this.repository.findOneBy({ id }); if (!item) throw new NotFoundException('Class period not found'); return item; }
  async update(id: number, dto: UpdateClassPeriodDto) {
    const item = await this.findOne(id);
    const name = dto.name ?? item.name;
    const startTime = dto.startTime ?? item.startTime;
    const endTime = dto.endTime ?? item.endTime;
    this.validate(name, startTime, endTime, dto.status);
    Object.assign(item, dto);
    if (dto.name !== undefined) item.name = dto.name.trim();
    return this.repository.save(item);
  }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }

  private validate(name: string, startTime: string, endTime: string, status?: boolean) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('name is required');
    }

    const start = this.parseTime(startTime, 'startTime');
    const end = this.parseTime(endTime, 'endTime');
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    if (status !== undefined && typeof status !== 'boolean') {
      throw new BadRequestException('status must be boolean');
    }
  }

  private parseTime(value: string, field: string) {
    if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
      throw new BadRequestException(`${field} must use the HH:mm or HH:mm:ss format`);
    }

    const [hours, minutes, seconds = 0] = value.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
}
