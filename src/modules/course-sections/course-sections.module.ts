import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSection } from './entities/course-section.entity';
import { CourseSectionsController } from './course-sections.controller';
import { CourseSectionsService } from './course-sections.service';

@Module({ imports: [TypeOrmModule.forFeature([CourseSection])], controllers: [CourseSectionsController], providers: [CourseSectionsService] })
export class CourseSectionsModule {}
