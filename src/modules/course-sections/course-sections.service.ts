import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  deactivate,
  findRef,
  pick,
  requireInt,
  requireText,
} from '../../common/helpers';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { StudyPlanAcademicCycle } from '../study-plan-academic-cycles/entities/study-plan-academic-cycle.entity';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { CourseSection } from './entities/course-section.entity';

const FIELDS = ['courseYear', 'section'] as const;
const RELATIONS = {
  studyPlanAcademicCycle: { studyPlan: true, academicCycle: true, shift: true },
};

@Injectable()
export class CourseSectionsService {
  constructor(
    @InjectRepository(CourseSection)
    private readonly repository: Repository<CourseSection>,
  ) {}

  async create(dto: CreateCourseSectionDto) {
    this.validate(dto);
    return this.repository.save(
      this.repository.create({
        ...pick(dto, [...FIELDS]),
        section: dto.section.trim(),
        status: 'ACTIVO',
        studyPlanAcademicCycle: await this.findCycle(
          dto.studyPlanAcademicCycleId,
        ),
      }),
    );
  }

  findAll() {
    return this.repository.find({ relations: RELATIONS, order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!item) throw new NotFoundException(`Course section ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateCourseSectionDto) {
    const item = await this.findOne(id);
    if (dto.studyPlanAcademicCycleId !== undefined) {
      item.studyPlanAcademicCycle = await this.findCycle(
        dto.studyPlanAcademicCycleId,
      );
    }
    Object.assign(item, pick(dto, [...FIELDS]));
    this.validate(item);
    item.section = item.section.trim();
    return this.repository.save(item);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const item = await this.findOne(id);
    item.status = dto.status;
    return this.repository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repository.save(
      deactivate(item, 'El curso/división ya se encuentra inactivo'),
    );
  }

  private findCycle(id: number) {
    return findRef(
      this.repository.manager,
      StudyPlanAcademicCycle,
      id,
      'Study plan academic cycle',
    );
  }

  private validate(s: Pick<CourseSection, 'courseYear' | 'section'>) {
    requireInt(s.courseYear, 'courseYear');
    requireText(s.section, 'section');
  }
}
