import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseSectionAssignmentDto } from './dto/create-course-section-assignment.dto';
import { UpdateCourseSectionAssignmentDto } from './dto/update-course-section-assignment.dto';
import { CourseSectionAssignment } from './entities/course_section_assignment.entity';

@Injectable()
export class CourseSectionAssignmentsService {
  constructor(@InjectRepository(CourseSectionAssignment) private readonly repository: Repository<CourseSectionAssignment>) {}

  create(dto: CreateCourseSectionAssignmentDto) { return this.repository.save(this.repository.create({ assignmentId: dto.assignmentId, courseSection: { id: dto.courseSectionId } })); }
  findAll() { return this.repository.find({ relations: { courseSection: true } }); }
  async findOne(id: number) { const item = await this.repository.findOne({ where: { id }, relations: { courseSection: true } }); if (!item) throw new NotFoundException('Course section assignment not found'); return item; }
  async update(id: number, dto: UpdateCourseSectionAssignmentDto) { const item = await this.findOne(id); if (dto.assignmentId !== undefined) item.assignmentId = dto.assignmentId; if (dto.courseSectionId !== undefined) item.courseSection = { id: dto.courseSectionId } as any; return this.repository.save(item); }
  async remove(id: number) { const item = await this.findOne(id); return this.repository.remove(item); }
}
