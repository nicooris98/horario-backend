import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  findRef,
  optionalStatus,
  pick,
  requireInt,
  requireText,
} from '../../common/helpers';
import { Regime } from '../regimes/entities/regime.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { Subject } from './entities/subject.entity';

const FIELDS = [
  'name',
  'year',
  'weeklyHours',
  'allowsMultipleTeachers',
  'maxTeachers',
  'status',
] as const;
const RELATIONS = { studyPlan: true, regime: true };

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly repository: Repository<Subject>,
  ) {}

  async create(dto: CreateAsignaturaDto) {
    this.validate({ ...dto, maxTeachers: dto.maxTeachers ?? null });
    const manager = this.repository.manager;
    return this.repository.save(
      this.repository.create({
        ...pick(dto, [...FIELDS]),
        name: dto.name.trim(),
        maxTeachers: dto.maxTeachers ?? null,
        studyPlan: await findRef(
          manager,
          StudyPlan,
          dto.studyPlanId,
          'Study plan',
        ),
        regime: await findRef(manager, Regime, dto.regimeId, 'Regime'),
      }),
    );
  }

  findAll() {
    return this.repository.find({ relations: RELATIONS, order: { id: 'ASC' } });
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
    Object.assign(subject, pick(dto, [...FIELDS]));
    this.validate(subject);
    subject.name = subject.name.trim();
    return this.repository.save(subject);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private validate(
    s: Pick<
      Subject,
      'name' | 'year' | 'weeklyHours' | 'allowsMultipleTeachers'
    > & { maxTeachers?: number | null; status?: string },
  ) {
    requireText(s.name, 'name');
    requireInt(s.year, 'year');
    requireInt(s.weeklyHours, 'weeklyHours');
    if (typeof s.allowsMultipleTeachers !== 'boolean') {
      throw new BadRequestException('allowsMultipleTeachers must be boolean');
    }
    if (s.maxTeachers != null) requireInt(s.maxTeachers, 'maxTeachers');
    optionalStatus(s.status);
  }
}
