import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { requireText } from '../../common/helpers';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto } from './dto/update-degrees.dto';
import { Degree } from './entities/degrees.entity';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(Degree)
    private readonly degreeRepository: Repository<Degree>,
  ) {}

  create(dto: CreateDegreeDto) {
    return this.degreeRepository.save(
      this.degreeRepository.create({ name: requireText(dto.name, 'name') }),
    );
  }

  findAll() {
    return this.degreeRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const degree = await this.degreeRepository.findOneBy({ id });
    if (!degree) {
      throw new NotFoundException(`No existe la carrera con id ${id}`);
    }
    return degree;
  }

  async update(id: number, dto: UpdateDegreeDto) {
    const degree = await this.findOne(id);
    if (dto.name !== undefined) degree.name = requireText(dto.name, 'name');
    return this.degreeRepository.save(degree);
  }

  async remove(id: number) {
    const degree = await this.findOne(id);
    await this.degreeRepository.remove(degree);
    return degree;
  }
}
