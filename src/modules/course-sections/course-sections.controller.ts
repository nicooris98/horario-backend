import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { CourseSectionsService } from './course-sections.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('course-sections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CourseSectionsController {
  constructor(private readonly service: CourseSectionsService) {}
  @Post() @Permissions('course-sections.create') create(@Body() dto: CreateCourseSectionDto) { return this.service.create(dto); }
  @Get() @Permissions('course-sections.read') findAll() { return this.service.findAll(); }
  @Get(':id') @Permissions('course-sections.read') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') @Permissions('course-sections.update') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseSectionDto) { return this.service.update(id, dto); }
  @Patch(':id/status') @Permissions('course-sections.update') updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) { return this.service.updateStatus(id, dto); }
  @Delete(':id') @Permissions('course-sections.delete') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
