import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { findRef, pick } from '../../common/helpers';
import { Regime } from '../regimes/entities/regime.entity';
import { StudyPlan } from '../study-plans/entities/study-plans.entity';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { UpdateSubjectStatusDto } from './dto/update-subject-status.dto';
import { FilterSubjectsDto } from './dto/filter-subjects.dto';
import { Subject } from './entities/subject.entity';

const FIELDS = [
  'name',
  'year',
  'weeklyHours',
  'allowsMultipleTeachers',
  'maxTeachers',
] as const;

const RELATIONS = { studyPlan: true, regime: true };

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly repository: Repository<Subject>,
  ) {}

  async create(dto: CreateAsignaturaDto) {
    const normalizedName = dto.name.trim();
    const manager = this.repository.manager;

    const studyPlan = await findRef(
      manager,
      StudyPlan,
      dto.studyPlanId,
      'Study plan',
    );
    const regime = await findRef(manager, Regime, dto.regimeId, 'Regime');

    this.validateSubjectData(dto, studyPlan.durationYears);
    await this.assertUniqueNameInPlan(normalizedName, studyPlan.id);

    const maxTeachers = this.resolveMaxTeachers(
      dto.allowsMultipleTeachers,
      dto.maxTeachers,
    );

    return this.repository.save(
      this.repository.create({
        ...pick(dto, [...FIELDS]),
        name: normalizedName,
        maxTeachers,
        status: 'ACTIVO',
        studyPlan,
        regime,
      }),
    );
  }

  findAll(filters?: FilterSubjectsDto) {
    const where = filters?.studyPlanId
      ? { studyPlan: { id: filters.studyPlanId } }
      : {};

    return this.repository.find({
      where,
      relations: RELATIONS,
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const subject = await this.repository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!subject) {
      throw new NotFoundException(`Curriculum subject ${id} not found`);
    }
    return subject;
  }

  async update(id: number, dto: UpdateAsignaturaDto) {
    const subject = await this.findOne(id);
    const manager = this.repository.manager;

    if (dto.studyPlanId !== undefined) {
      subject.studyPlan = await findRef(
        manager,
        StudyPlan,
        dto.studyPlanId,
        'Study plan',
      );
    }
    if (dto.regimeId !== undefined) {
      subject.regime = await findRef(manager, Regime, dto.regimeId, 'Regime');
    }

    if (dto.name !== undefined) {
      subject.name = dto.name.trim();
    }
    if (dto.year !== undefined) {
      subject.year = dto.year;
    }
    if (dto.weeklyHours !== undefined) {
      subject.weeklyHours = dto.weeklyHours;
    }
    if (dto.allowsMultipleTeachers !== undefined) {
      subject.allowsMultipleTeachers = dto.allowsMultipleTeachers;
    }
    if (dto.maxTeachers !== undefined) {
      subject.maxTeachers = dto.maxTeachers;
    }

    this.validateSubjectData(
      {
        name: subject.name,
        year: subject.year,
        weeklyHours: subject.weeklyHours,
        allowsMultipleTeachers: subject.allowsMultipleTeachers,
        maxTeachers: subject.maxTeachers,
      },
      subject.studyPlan.durationYears,
    );

    await this.assertUniqueNameInPlan(subject.name, subject.studyPlan.id, id);

    subject.maxTeachers = this.resolveMaxTeachers(
      subject.allowsMultipleTeachers,
      subject.maxTeachers,
    );

    return this.repository.save(subject);
  }

  async updateStatus(id: number, dto: UpdateSubjectStatusDto) {
    const subject = await this.findOne(id);

    if (subject.status === dto.status) {
      return subject;
    }

    subject.status = dto.status;
    return this.repository.save(subject);
  }

  async remove(id: number) {
    const subject = await this.findOne(id);

    if (subject.status === 'INACTIVO') {
      throw new ConflictException('La materia ya se encuentra inactiva');
    }

    subject.status = 'INACTIVO';
    return this.repository.save(subject);
  }

  private resolveMaxTeachers(
    allowsMultiple: boolean,
    maxTeachers?: number | null,
  ): number | null {
    if (!allowsMultiple) {
      return null;
    }
    return maxTeachers ?? 2;
  }

  private validateSubjectData(
    data: {
      name: string;
      year: number;
      weeklyHours: number;
      allowsMultipleTeachers: boolean;
      maxTeachers?: number | null;
    },
    planDurationYears: number,
  ) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('El nombre de la materia es obligatorio');
    }

    if (!Number.isInteger(data.year) || data.year < 1) {
      throw new BadRequestException('El año de cursado debe ser mayor o igual a 1');
    }

    if (data.year > planDurationYears) {
      throw new BadRequestException(
        `El año de cursado (${data.year}) no puede ser mayor a la duración del plan (${planDurationYears} años).`,
      );
    }

    if (!Number.isInteger(data.weeklyHours) || data.weeklyHours < 1) {
      throw new BadRequestException('Las horas semanales deben ser un entero positivo');
    }

    if (typeof data.allowsMultipleTeachers !== 'boolean') {
      throw new BadRequestException('allowsMultipleTeachers debe ser un valor booleano');
    }

    if (data.allowsMultipleTeachers) {
      if (
        data.maxTeachers !== undefined &&
        data.maxTeachers !== null &&
        (!Number.isInteger(data.maxTeachers) || data.maxTeachers < 2)
      ) {
        throw new BadRequestException(
          'Si la materia permite múltiples docentes, el máximo debe ser un entero mayor o igual a 2',
        );
      }
    }
  }

  private async assertUniqueNameInPlan(
    name: string,
    studyPlanId: number,
    excludeSubjectId?: number,
  ): Promise<void> {
    const query = this.repository
      .createQueryBuilder('subject')
      .where('subject.id_plan_estudio = :studyPlanId', { studyPlanId })
      .andWhere('LOWER(TRIM(subject.nombre)) = LOWER(:name)', {
        name: name.trim(),
      });

    if (excludeSubjectId) {
      query.andWhere('subject.id_espacio_curricular != :excludeSubjectId', {
        excludeSubjectId,
      });
    }

    const count = await query.getCount();
    if (count > 0) {
      throw new ConflictException(
        'Ya existe una materia con ese nombre en este plan de estudio.',
      );
    }
  }
}
