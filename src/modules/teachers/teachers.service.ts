import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  optionalStatus,
  pick,
  requireInt,
  requireText,
} from '../../common/helpers';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './entities/teacher.entity';

const FIELDS = [
  'dni',
  'firstName',
  'lastName',
  'phone',
  'email',
  'fileNumber',
  'status',
] as const;

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly repository: Repository<Teacher>,
  ) {}

  create(dto: CreateTeacherDto) {
    this.validate(dto);
    // La columna estado del script no tiene DEFAULT y synchronize está en
    // false, así que el default de la entidad no llega a la base.
    return this.repository.save(
      this.repository.create({
        ...this.normalize(pick(dto, [...FIELDS])),
        status: dto.status ?? 'ACTIVO',
      }),
    );
  }

  findAll() {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Teacher ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const item = await this.findOne(id);
    Object.assign(item, pick(dto, [...FIELDS]));
    this.validate(item);
    return this.repository.save(Object.assign(item, this.normalize(item)));
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private normalize(t: Partial<Teacher>) {
    return {
      ...t,
      dni: t.dni?.trim(),
      firstName: t.firstName?.trim(),
      lastName: t.lastName?.trim(),
    };
  }

  private validate(
    t: Pick<Teacher, 'dni' | 'firstName' | 'lastName'> & {
      fileNumber?: number | null;
      status?: string;
    },
  ) {
    requireText(t.dni, 'dni');
    requireText(t.firstName, 'firstName');
    requireText(t.lastName, 'lastName');
    if (t.fileNumber != null) requireInt(t.fileNumber, 'fileNumber');
    optionalStatus(t.status);
  }
}
