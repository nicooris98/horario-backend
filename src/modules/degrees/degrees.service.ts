import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { requireText } from '../../common/helpers';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto } from './dto/update-degrees.dto';
import { Degree } from './entities/degrees.entity';
import { UpdateDegreeStatusDto } from './dto/update-degrees.dto';

function isForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;

  if ('code' in error && error.code === '23503') return true;

  if (!('driverError' in error)) return false;
  const driverError = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === '23503'
  );
}

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

  async updateStatus(id: number, dto: UpdateDegreeStatusDto) {
    const degree = await this.findOne(id);

    if (degree.status === dto.status) {
      return degree;
    }

    degree.status = dto.status;
    return this.degreeRepository.save(degree);
  }

  async remove(id: number) {
    const degree = await this.findOne(id);

    if (degree.status === 'INACTIVO') {
    throw new ConflictException('La carrera ya se encuentra inactiva');
    }

    degree.status = 'INACTIVO';
    return this.degreeRepository.save(degree);
  }
}
