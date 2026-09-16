import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto } from './dto/update-degrees.dto';
import { Degree } from './entities/degrees.entity';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(Degree)
    private readonly degreeRepository: Repository<Degree>,
  ) {}

  create(createDegreeDto: CreateDegreeDto) {
    this.validateName(createDegreeDto.name);
    this.validateStatus(createDegreeDto.status);

    const degree = this.degreeRepository.create({
      name: createDegreeDto.name.trim(),
      status: createDegreeDto.status ?? true,
    });

    return this.degreeRepository.save(degree);
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

  async update(id: number, updateDegreeDto: UpdateDegreeDto) {
    const degree = await this.findOne(id);

    if (updateDegreeDto.name !== undefined) {
      this.validateName(updateDegreeDto.name);
      degree.name = updateDegreeDto.name.trim();
    }

    if (updateDegreeDto.status !== undefined) {
      this.validateStatus(updateDegreeDto.status);
      degree.status = updateDegreeDto.status;
    }

    return this.degreeRepository.save(degree);
  }

  async remove(id: number) {
    const degree = await this.findOne(id);
    await this.degreeRepository.remove(degree);
    return degree;
  }

  private validateName(name: string) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('name is required');
    }
  }

  private validateStatus(status: boolean | undefined) {
    if (status !== undefined && typeof status !== 'boolean') {
      throw new BadRequestException('status must be boolean');
    }
  }
}
