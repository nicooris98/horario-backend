import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  findRef,
  optionalStatus,
  pick,
  requireDateOrder,
  requireInt,
  requirePositive,
  requireText,
} from '../../common/helpers';
import { Degree } from '../degrees/entities/degrees.entity';
import { Subject } from '../curriculum-subjects/entities/subject.entity';
import { CreateStudyPlanDto } from './dto/create-study-plans.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plans.dto';
import { StudyPlan } from './entities/study-plans.entity';

const FIELDS = [
  'name',
  'durationYears',
  'validityYear',
  'startDate',
  'endDate',
  'status',
] as const;

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectRepository(StudyPlan)
    private readonly repository: Repository<StudyPlan>,
  ) {}

  async create(dto: CreateStudyPlanDto) {
    this.validate(dto);
    const degree = await findRef(
      this.repository.manager,
      Degree,
      dto.degreeId,
      'Degree',
    );
    return this.repository.save(
      this.repository.create({
        ...pick(dto, [...FIELDS]),
        name: dto.name.trim(),
        endDate: dto.endDate ?? null,
        degree,
      }),
    );
  }

  findAll() {
    return this.repository.find({
      relations: { degree: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const plan = await this.repository.findOne({
      where: { id },
      relations: { degree: true },
    });
    if (!plan) throw new NotFoundException(`Study plan ${id} not found`);
    return plan;
  }

  async update(id: number, dto: UpdateStudyPlanDto) {
    const plan = await this.findOne(id);
    if (dto.degreeId !== undefined) {
      plan.degree = await findRef(
        this.repository.manager,
        Degree,
        dto.degreeId,
        'Degree',
      );
    }
    Object.assign(plan, pick(dto, [...FIELDS]));
    this.validate(plan);
    plan.name = plan.name.trim();
    return this.repository.save(plan);
  }

  async remove(id: number) {
    const plan = await this.findOne(id);

    if (plan.status === 'INACTIVO') {
      throw new ConflictException('El plan ya se encuentra inactivo.');
    }

    // Regla RN-12: Verificar que no tenga materias (espacios curriculares) asignadas
    const subjectsCount = await this.repository.manager.count(Subject, {
      where: { studyPlan: { id } },
    });

    if (subjectsCount > 0) {
      throw new ConflictException(
        'No se puede archivar el plan porque tiene espacios curriculares (materias) asociados.',
      );
    }

    // Baja lógica (RN-11): Solo cambiamos el estado a INACTIVO en lugar de borrar físicamente
    plan.status = 'INACTIVO';
    return this.repository.save(plan);
  }

  private validate(
    plan: Pick<
      StudyPlan,
      'name' | 'durationYears' | 'validityYear' | 'startDate'
    > & { endDate?: string | null; status?: string },
  ) {
    requireText(plan.name, 'name');
    requirePositive(plan.durationYears, 'durationYears');
    requireInt(plan.validityYear, 'validityYear');
    requireDateOrder(plan.startDate, plan.endDate, 'startDate', 'endDate');
    optionalStatus(plan.status);
  }
}