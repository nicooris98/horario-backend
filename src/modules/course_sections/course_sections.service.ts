import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { CourseSection } from './entities/course_section.entity';

@Injectable()
export class CourseSectionsService {
  constructor(@InjectRepository(CourseSection) private readonly repository: Repository<CourseSection>) {}

  create(dto: CreateCourseSectionDto) { return this.repository.save(this.repository.create({ ...dto, academicCycle: { id: dto.academicCycleId }, studyPlan: { id: dto.studyPlanId }, degree: { id: dto.degreeId }, classPeriod: { id: dto.classPeriodId }, status: dto.status ?? true })); }
  findAll() { return this.repository.find({ relations: { academicCycle: true, studyPlan: true, degree: true, classPeriod: true } }); }
  async findOne(id: number) { const item = await this.repository.findOne({ where: { id }, relations: { academicCycle: true, studyPlan: true, degree: true, classPeriod: true } }); if (!item) throw new NotFoundException('Course section not found'); return item; }
  async update(id: number, dto: UpdateCourseSectionDto) { const item = await this.findOne(id); Object.assign(item, dto); if (dto.academicCycleId !== undefined) item.academicCycle = { id: dto.academicCycleId } as any; if (dto.studyPlanId !== undefined) item.studyPlan = { id: dto.studyPlanId } as any; if (dto.degreeId !== undefined) item.degree = { id: dto.degreeId } as any; if (dto.classPeriodId !== undefined) item.classPeriod = { id: dto.classPeriodId } as any; return this.repository.save(item); }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }
}
