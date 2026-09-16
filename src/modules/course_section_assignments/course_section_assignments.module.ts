import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSectionAssignment } from './entities/course_section_assignment.entity';
import { CourseSectionAssignmentsController } from './course_section_assignments.controller';
import { CourseSectionAssignmentsService } from './course_section_assignments.service';

@Module({ imports: [TypeOrmModule.forFeature([CourseSectionAssignment])], controllers: [CourseSectionAssignmentsController], providers: [CourseSectionAssignmentsService] })
export class CourseSectionAssignmentsModule {}
