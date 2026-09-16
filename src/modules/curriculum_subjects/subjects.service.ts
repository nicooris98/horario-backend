import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { Subject } from './entities/subject.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';

@Injectable()
export class SubjectsService {
  constructor(@InjectRepository(Subject) private readonly subjectRepository: Repository<Subject>, @InjectRepository(StudyPlan) private readonly studyPlanRepository: Repository<StudyPlan>) {}

  async create(dto: CreateAsignaturaDto) {
    this.validate(dto);
    const studyPlan = await this.findStudyPlan(dto.studyPlanId);
    return this.subjectRepository.save(this.subjectRepository.create({
      name: dto.name.trim(), year: dto.year, regime: dto.regime, weeklyHours: dto.weeklyHours,
      allowsMultipleTeachers: dto.allowsMultipleTeachers, maxTeachers: dto.maxTeachers ?? null,
      status: dto.status ?? true, studyPlan,
    }));
  }

  findAll() { return this.subjectRepository.find({ relations: { studyPlan: true }, order: { id: 'ASC' } }); }

  async findOne(id: number) {
    const subject = await this.subjectRepository.findOne({ where: { id }, relations: { studyPlan: true } });
    if (!subject) throw new NotFoundException(`Curriculum subject ${id} not found`);
    return subject;
  }

  async update(id: number, dto: UpdateAsignaturaDto) {
    const subject = await this.findOne(id);
    if (dto.name !== undefined) { this.validateName(dto.name); subject.name = dto.name.trim(); }
    if (dto.year !== undefined) subject.year = this.validateInteger(dto.year, 'year');
    if (dto.regime !== undefined) subject.regime = dto.regime;
    if (dto.weeklyHours !== undefined) subject.weeklyHours = this.validatePositive(dto.weeklyHours, 'weeklyHours');
    if (dto.allowsMultipleTeachers !== undefined) subject.allowsMultipleTeachers = dto.allowsMultipleTeachers;
    if (dto.maxTeachers !== undefined) subject.maxTeachers = dto.maxTeachers;
    if (dto.status !== undefined) subject.status = dto.status;
    if (dto.studyPlanId !== undefined) subject.studyPlan = await this.findStudyPlan(dto.studyPlanId);
    return this.subjectRepository.save(subject);
  }

  async remove(id: number) { return this.subjectRepository.remove(await this.findOne(id)); }
  private async findStudyPlan(id: number) { const plan = await this.studyPlanRepository.findOneBy({ id }); if (!plan) throw new NotFoundException(`Study plan ${id} not found`); return plan; }
  private validate(dto: CreateAsignaturaDto) { this.validateName(dto.name); this.validateInteger(dto.year, 'year'); this.validatePositive(dto.weeklyHours, 'weeklyHours'); if (typeof dto.allowsMultipleTeachers !== 'boolean') throw new BadRequestException('allowsMultipleTeachers must be boolean'); }
  private validateName(name: string) { if (typeof name !== 'string' || !name.trim()) throw new BadRequestException('name is required'); }
  private validateInteger(value: number, field: string) { if (!Number.isInteger(value) || value <= 0) throw new BadRequestException(`${field} must be a positive integer`); return value; }
  private validatePositive(value: number, field: string) { if (!Number.isFinite(value) || value <= 0) throw new BadRequestException(`${field} must be positive`); return value; }
}
