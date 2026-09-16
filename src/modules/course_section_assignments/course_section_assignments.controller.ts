import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CourseSectionAssignmentsService } from './course_section_assignments.service';
import { CreateCourseSectionAssignmentDto } from './dto/create-course-section-assignment.dto';
import { UpdateCourseSectionAssignmentDto } from './dto/update-course-section-assignment.dto';

@Controller('course-section-assignments')
export class CourseSectionAssignmentsController {
  constructor(private readonly service: CourseSectionAssignmentsService) {}
  @Post() create(@Body() dto: CreateCourseSectionAssignmentDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseSectionAssignmentDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
