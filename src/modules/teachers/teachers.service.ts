import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  ILike,
  In,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { FOREIGN_KEY_VIOLATION } from '../../common/constants/database.constants';
import { pick, requireInt, requireText } from '../../common/helpers';
import { TeacherAssignment } from '../teacher-assignments/entities/teacher-assignment.entity';
import { activeOn } from '../teacher-assignments/teacher-assignments.helpers';
import { FIELDS, TEACHER_STATUSES } from './constants/teachers.constants';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './entities/teacher.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly repository: Repository<Teacher>,
    @InjectRepository(TeacherAssignment)
    private readonly assignments: Repository<TeacherAssignment>,
  ) {}

  async create(dto: CreateTeacherDto) {
    const data = this.normalize(pick(dto, [...FIELDS]));
    this.validate(data);
    await this.requireUniqueDni(data.dni);
    return this.repository.save(this.repository.create(data));
  }

  async search(dni?: string, lastName?: string, page = 1, limit = 15) {
    const take = Math.min(Math.max(Number.isFinite(limit) ? limit : 15, 1), 50);
    const currentPage = Math.max(Number.isFinite(page) ? page : 1, 1);
    const where: FindOptionsWhere<Teacher> = {};

    if (dni?.trim()) {
      const digits = dni.replace(/\D/g, '');
      if (!digits) return { items: [], total: 0 };
      where.dni = ILike(`%${digits}%`);
    }
    if (lastName?.trim()) {
      where.lastName = ILike(`%${lastName.trim()}%`);
    }

    // El DNI y el apellido filtran toda la tabla. page/limit solo recortan ese resultado.
    const [found, total] = await this.repository.findAndCount({
      where,
      order: { lastName: 'ASC', firstName: 'ASC', id: 'ASC' },
      skip: (currentPage - 1) * take,
      take,
    });

    return {
      items: await this.withCurrentAssignments(found),
      total,
    };
  }

  // HU-M2-02: la búsqueda muestra también los cargos vigentes de cada docente.
  private async withCurrentAssignments(teachers: Teacher[]) {
    if (teachers.length === 0) return [];

    const current = await this.assignments.find({
      where: activeOn({ teacher: { id: In(teachers.map((t) => t.id)) } }),
      relations: {
        teacher: true,
        positionType: true,
        courseSectionSubject: { subject: true, courseSection: true },
      },
      order: { startDate: 'ASC' },
    });
    return teachers.map((teacher) => ({
      ...teacher,
      currentAssignments: current
        .filter((a) => a.teacher.id === teacher.id)
        .map((a) => ({ ...a, teacher: undefined })),
    }));
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
