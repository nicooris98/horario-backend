import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSection } from './entities/course_section.entity';
import { CourseSectionsController } from './course_sections.controller';
import { CourseSectionsService } from './course_sections.service';

@Module({ imports: [TypeOrmModule.forFeature([CourseSection])], controllers: [CourseSectionsController], providers: [CourseSectionsService] })
export class CourseSectionsModule {}
