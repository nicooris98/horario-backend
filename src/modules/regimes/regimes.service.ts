import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { requireText } from '../../common/helpers';
import { CreateRegimeDto } from './dto/create-regime.dto';
import { UpdateRegimeDto } from './dto/update-regime.dto';
import { Regime } from './entities/regime.entity';

@Injectable()
export class RegimesService {
  constructor(
    @InjectRepository(Regime) private readonly repository: Repository<Regime>,
  ) {}

  create(dto: CreateRegimeDto) {
    return this.repository.save(
      this.repository.create({ name: requireText(dto.name, 'name') }),
    );
  }

  findAll() {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Regime ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateRegimeDto) {
    const item = await this.findOne(id);
    if (dto.name !== undefined) item.name = requireText(dto.name, 'name');
    return this.repository.save(item);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }
}
