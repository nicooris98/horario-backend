import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  findRef,
  optionalStatus,
  pick,
  requireInt,
  requireText,
} from '../../common/helpers';
import { StudyPlanAcademicCycle } from '../study-plan-academic-cycles/entities/study-plan-academic-cycle.entity';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { CourseSection } from './entities/course-section.entity';

const FIELDS = ['courseYear', 'section', 'status'] as const;
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

  async remove(id: number) {
    return this.repository.remove(await this.findOne(id));
  }

  private findCycle(id: number) {
    return findRef(
      this.repository.manager,
      StudyPlanAcademicCycle,
      id,
      'Study plan academic cycle',
    );
  }

  private validate(
    s: Pick<CourseSection, 'courseYear' | 'section'> & { status?: string },
  ) {
    requireInt(s.courseYear, 'courseYear');
    requireText(s.section, 'section');
    optionalStatus(s.status);
  }
}
