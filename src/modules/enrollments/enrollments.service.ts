import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class EnrollmentsService {
  constructor(@InjectRepository(Enrollment) private readonly repository: Repository<Enrollment>) {}

  create(dto: CreateEnrollmentDto) { return this.repository.save(this.repository.create({ courseSection: { id: dto.courseSectionId }, curriculumSubject: { id: dto.curriculumSubjectId }, status: dto.status ?? true })); }
  findAll() { return this.repository.find({ relations: { courseSection: true, curriculumSubject: true } }); }
  async findOne(id: number) { const item = await this.repository.findOne({ where: { id }, relations: { courseSection: true, curriculumSubject: true } }); if (!item) throw new NotFoundException('Enrollment not found'); return item; }
  async update(id: number, dto: UpdateEnrollmentDto) { const item = await this.findOne(id); if (dto.courseSectionId !== undefined) item.courseSection = { id: dto.courseSectionId } as any; if (dto.curriculumSubjectId !== undefined) item.curriculumSubject = { id: dto.curriculumSubjectId } as any; if (dto.status !== undefined) item.status = dto.status; return this.repository.save(item); }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }
}
