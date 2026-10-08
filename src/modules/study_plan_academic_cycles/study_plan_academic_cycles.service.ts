import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { findRef } from '../../common/helpers';
import { AcademicCycle } from '../academic_cycles/entities/academic_cycle.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';
import { CreateStudyPlanAcademicCycleDto } from './dto/create-study-plan-academic-cycle.dto';
import { UpdateStudyPlanAcademicCycleDto } from './dto/update-study-plan-academic-cycle.dto';
import { StudyPlanAcademicCycle } from './entities/study_plan_academic_cycle.entity';

const RELATIONS = { studyPlan: true, academicCycle: true, shift: true };

@Injectable()
export class StudyPlanAcademicCyclesService {
  constructor(
    @InjectRepository(StudyPlanAcademicCycle)
    private readonly repository: Repository<StudyPlanAcademicCycle>,
  ) {}

  async create(dto: CreateStudyPlanAcademicCycleDto) {
    const item = this.repository.create();
    await this.assignRefs(item, dto);
    return this.repository.save(item);
  }

  findAll() {
    return this.repository.find({ relations: RELATIONS, order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!item) {
      throw new NotFoundException(`Study plan academic cycle ${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateStudyPlanAcademicCycleDto) {
    const item = await this.findOne(id);
    await this.assignRefs(item, dto);
    return this.repository.save(item);
  }

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private async assignRefs(
    item: StudyPlanAcademicCycle,
    dto: UpdateStudyPlanAcademicCycleDto,
  ) {
    const m = this.repository.manager;
    if (dto.studyPlanId !== undefined || !item.studyPlan) {
      item.studyPlan = await findRef(m, StudyPlan, dto.studyPlanId, 'Study plan');
    }
    if (dto.academicCycleId !== undefined || !item.academicCycle) {
      item.academicCycle = await findRef(
        m,
        AcademicCycle,
        dto.academicCycleId,
        'Academic cycle',
      );
    }
    if (dto.shiftId !== undefined || !item.shift) {
      item.shift = await findRef(m, Shift, dto.shiftId, 'Shift');
    }
  }
}
