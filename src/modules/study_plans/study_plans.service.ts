import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudyPlanDto } from './dto/create-study_plans.dto';
import { UpdateStudyPlanDto } from './dto/update-study_plans.dto';
import { StudyPlan } from './entities/study_plans.entity';
import { Degree } from '../degrees/entities/degrees.entity';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectRepository(StudyPlan) private readonly studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(Degree) private readonly degreeRepository: Repository<Degree>,
  ) {}

  async create(dto: CreateStudyPlanDto) {
    this.validate(dto);
    const degree = await this.findDegree(dto.degreeId);
    return this.studyPlanRepository.save(this.studyPlanRepository.create({
      name: dto.name.trim(), ministerialResolution: dto.ministerialResolution.trim(),
      durationYears: dto.durationYears, validityYear: dto.validityYear,
      startDate: dto.startDate, endDate: dto.endDate ?? null, status: dto.status ?? true, degree,
    }));
  }

  findAll() { return this.studyPlanRepository.find({ relations: { degree: true } }); }

  async findOne(id: number) {
    const plan = await this.studyPlanRepository.findOne({ where: { id }, relations: { degree: true } });
    if (!plan) throw new NotFoundException(`Study plan ${id} not found`);
    return plan;
  }

  async update(id: number, dto: UpdateStudyPlanDto) {
    const plan = await this.findOne(id);
    if (dto.name !== undefined) { this.validateName(dto.name); plan.name = dto.name.trim(); }
    if (dto.ministerialResolution !== undefined) {
      this.validateMinisterialResolution(dto.ministerialResolution);
      plan.ministerialResolution = dto.ministerialResolution.trim();
    }
    if (dto.degreeId !== undefined) plan.degree = await this.findDegree(dto.degreeId);
    if (dto.durationYears !== undefined) plan.durationYears = this.validatePositiveNumber(dto.durationYears, 'durationYears');
    if (dto.validityYear !== undefined) plan.validityYear = this.validatePositiveInteger(dto.validityYear, 'validityYear');
    if (dto.startDate !== undefined) plan.startDate = dto.startDate;
    if (dto.endDate !== undefined) plan.endDate = dto.endDate;
    if (dto.status !== undefined) plan.status = dto.status;
    this.validateDates(plan.startDate, plan.endDate);
    return this.studyPlanRepository.save(plan);
  }

  async remove(id: number) { return this.studyPlanRepository.remove(await this.findOne(id)); }

  private async findDegree(id: number) {
    this.validatePositiveInteger(id, 'degreeId');
    const degree = await this.degreeRepository.findOneBy({ id });
    if (!degree) throw new NotFoundException(`Degree ${id} not found`);
    return degree;
  }

  private validate(dto: CreateStudyPlanDto) {
    this.validateName(dto.name);
    this.validateMinisterialResolution(dto.ministerialResolution);
    this.validatePositiveNumber(dto.durationYears, 'durationYears');
    this.validatePositiveInteger(dto.validityYear, 'validityYear');
    this.validateDates(dto.startDate, dto.endDate);
    if (dto.status !== undefined && typeof dto.status !== 'boolean') throw new BadRequestException('status must be boolean');
  }

  private validateName(name: string) { if (typeof name !== 'string' || !name.trim()) throw new BadRequestException('name is required'); }
  private validateMinisterialResolution(value: string) { if (typeof value !== 'string' || !value.trim()) throw new BadRequestException('ministerialResolution is required'); }
  private validatePositiveNumber(value: number, field: string) { if (!Number.isFinite(value) || value <= 0) throw new BadRequestException(`${field} must be positive`); return value; }
  private validatePositiveInteger(value: number, field: string) { if (!Number.isInteger(value) || value <= 0) throw new BadRequestException(`${field} must be a positive integer`); return value; }
  private validateDates(startDate: string, endDate?: string | null) {
    if (!startDate || Number.isNaN(Date.parse(startDate))) throw new BadRequestException('startDate must be a valid date');
    if (endDate && (Number.isNaN(Date.parse(endDate)) || new Date(endDate) < new Date(startDate))) throw new BadRequestException('endDate must be after startDate');
  }
}
