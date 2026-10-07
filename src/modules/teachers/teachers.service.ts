import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, QueryFailedError, Repository } from 'typeorm';
import { pick, requireInt, requireText } from '../../common/helpers';
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

export const TEACHER_STATUSES = ['ACTIVO', 'INACTIVO'] as const;

// Código de Postgres para violación de clave foránea.
const FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly repository: Repository<Teacher>,
  ) {}

  async create(dto: CreateTeacherDto) {
    const data = this.normalize(pick(dto, [...FIELDS]));
    this.validate(data);
    await this.requireUniqueDni(data.dni);
    return this.repository.save(this.repository.create(data));
  }

  findAll() {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async search(dni?: string, lastName?: string) {
    if (dni === undefined && lastName === undefined) return this.findAll();

    const where: FindOptionsWhere<Teacher> = {};
    if (dni !== undefined) where.dni = this.cleanDni(dni);
    if (lastName !== undefined) {
      where.lastName = ILike(`%${requireText(lastName, 'lastName')}%`);
    }

    const found = await this.repository.find({
      where,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
    if (!found.length) {
      const criteria = [
        dni !== undefined && `DNI ${where.dni as string}`,
        lastName !== undefined && `apellido "${lastName.trim()}"`,
      ].filter(Boolean);
      throw new NotFoundException(
        `No se encontraron docentes con ${criteria.join(' y ')}`,
      );
    }
    return found;
  }

  async findOne(id: number) {
    const item = await this.repository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Teacher ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const item = await this.findOne(id);
    const data = this.normalize({ ...item, ...pick(dto, [...FIELDS]) });
    this.validate(data);
    if (data.dni !== item.dni) await this.requireUniqueDni(data.dni, id);
    return this.repository.save(Object.assign(item, data));
  }

  async deactivate(id: number) {
    const item = await this.findOne(id);
    item.status = 'INACTIVO';
    return this.repository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    try {
      return await this.repository.remove(item);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION
      ) {
        throw new ConflictException(
          `Teacher ${id} has assignments and cannot be deleted; deactivate it instead`,
        );
      }
      throw error;
    }
  }

  private async requireUniqueDni(dni: string, exceptId?: number) {
    const existing = await this.repository.findOneBy({ dni });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(
        `A teacher with DNI ${dni} already exists (id ${existing.id})`,
      );
    }
  }

  // Acepta el DNI con o sin puntos ("39.040.338" o "39040338").
  private cleanDni(value: unknown) {
    const dni = requireText(value, 'dni').replace(/[.\s]/g, '');
    if (!/^\d{7,8}$/.test(dni)) {
      throw new BadRequestException('dni must have 7 or 8 digits');
    }
    return dni;
  }

  private normalize(t: Partial<Teacher>) {
    const optionalText = (v: string | null | undefined) => v?.trim() || null;
    return {
      ...t,
      dni: this.cleanDni(t.dni),
      firstName: requireText(t.firstName, 'firstName'),
      lastName: requireText(t.lastName, 'lastName'),
      phone: optionalText(t.phone),
      email: optionalText(t.email)?.toLowerCase() ?? null,
      fileNumber: t.fileNumber ?? null,
      // La columna estado del script no tiene DEFAULT y synchronize está en
      // false, así que un default en la entidad no llegaría a la base.
      status: requireText(t.status ?? 'ACTIVO', 'status').toUpperCase(),
    };
  }

  private validate(t: ReturnType<TeachersService['normalize']>) {
    if (!t.phone && !t.email) {
      throw new BadRequestException(
        'at least one contact field is required (phone or email)',
      );
    }
    if (t.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email)) {
      throw new BadRequestException('email is not valid');
    }
    if (t.fileNumber !== null) requireInt(t.fileNumber, 'fileNumber');
    if (!(TEACHER_STATUSES as readonly string[]).includes(t.status)) {
      throw new BadRequestException(
        `status must be one of: ${TEACHER_STATUSES.join(', ')}`,
      );
    }
  }
}
