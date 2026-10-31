import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  findRef,
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
import { STUDY_PLAN_STATUS, STUDY_PLAN_STATUS_VALUES } from './study-plan-status';

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

    const status = dto.status ?? STUDY_PLAN_STATUS.VIGENTE;
    if (status === STUDY_PLAN_STATUS.ARCHIVADO) {
      throw new BadRequestException('Un plan de estudio no se puede crear archivado.');
    }

    const degree = await findRef(
      this.repository.manager,
      Degree,
      dto.degreeId,
      'Degree',
    );

    return this.repository.manager.transaction(async (manager) => {
      if (status === STUDY_PLAN_STATUS.VIGENTE) {
        await this.resolveVigenteConflict(
          manager,
          degree.id,
          undefined,
          dto.replaceCurrentVigente,
        );
      }

      const repo = manager.getRepository(StudyPlan);
      return repo.save(
        repo.create({
          ...pick(dto, [...FIELDS]),
          name: dto.name.trim(),
          endDate: dto.endDate ?? null,
          degree,
          status,
        }),
      );
    });
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
    const previousStatus = plan.status;

    if (dto.status !== undefined && dto.status !== previousStatus) {
      this.assertStatusChange(previousStatus, dto.status);
    }

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

    return this.repository.manager.transaction(async (manager) => {
      if (plan.status === STUDY_PLAN_STATUS.VIGENTE) {
        await this.resolveVigenteConflict(
          manager,
          plan.degree.id,
          plan.id,
          dto.replaceCurrentVigente,
        );
      }
      return manager.getRepository(StudyPlan).save(plan);
    });
  }

  async remove(id: number) {
    const plan = await this.findOne(id);

    if (plan.status === STUDY_PLAN_STATUS.ARCHIVADO) {
      throw new ConflictException('El plan ya se encuentra archivado.');
    }

    // PENDIENTE (HU-PLA-03): reemplazar este control por el de divisiones abiertas
    // en el ciclo lectivo vigente. Se deja hasta ver las entidades de ciclo y división.
    const subjectsCount = await this.repository.manager.count(Subject, {
      where: { studyPlan: { id } },
    });

    if (subjectsCount > 0) {
      throw new ConflictException(
        'No se puede archivar el plan porque tiene espacios curriculares (materias) asociados.',
      );
    }

    // Baja lógica (RN-11): no se borra, solo cambia el estado.
    plan.status = STUDY_PLAN_STATUS.ARCHIVADO;
    return this.repository.save(plan);
  }

  private assertStatusChange(from: string, to: string) {
    if (from === STUDY_PLAN_STATUS.ARCHIVADO) {
      throw new ConflictException('Un plan archivado no puede volver a otro estado.');
    }
    if (to === STUDY_PLAN_STATUS.ARCHIVADO) {
      throw new ConflictException('Para archivar un plan usá la acción "Archivar plan".');
    }
  }

  /**
   * Si la carrera ya tiene otro plan vigente:
   * - sin confirmación: responde 409 con el código VIGENTE_EXISTENTE y el nombre del plan.
   * - con confirmación (replace = true): pasa el anterior a NO_VIGENTE.
   * Debe correr antes de guardar el plan nuevo: el índice único solo admite un vigente por carrera.
   */
  private async resolveVigenteConflict(
    manager: EntityManager,
    degreeId: number,
    excludePlanId: number | undefined,
    replace?: boolean,
  ) {
    const repo = manager.getRepository(StudyPlan);
    const current = await repo.findOne({
      where: { degree: { id: degreeId }, status: STUDY_PLAN_STATUS.VIGENTE },
    });

    if (!current || current.id === excludePlanId) return;

    if (!replace) {
      throw new ConflictException({
        statusCode: 409,
        code: 'VIGENTE_EXISTENTE',
        message: `La carrera ya tiene un plan vigente: ${current.name}.`,
        currentPlan: { id: current.id, name: current.name },
      });
    }

    current.status = STUDY_PLAN_STATUS.NO_VIGENTE;
    await repo.save(current);
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
    if (plan.status !== undefined && !STUDY_PLAN_STATUS_VALUES.includes(plan.status)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${STUDY_PLAN_STATUS_VALUES.join(', ')}.`,
      );
    }
  }
}