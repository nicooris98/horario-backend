import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';

@Controller('teacher-assignments')
export class TeacherAssignmentsController {
  constructor(
    private readonly teacherAssignmentsService: TeacherAssignmentsService,
  ) {}

  @Post()
  create(@Body() createTeacherAssignmentDto: CreateTeacherAssignmentDto) {
    return this.teacherAssignmentsService.create(createTeacherAssignmentDto);
  }

  @Get()
  findAll(@Query('teacherId') teacherId?: string) {
    return this.teacherAssignmentsService.findAll(teacherId);
  }

  @Get('expiring')
  findExpiring(@Query('days') days?: string) {
    return this.teacherAssignmentsService.findExpiring(days);
  }

  @Get('substitutions')
  findActiveSubstitutions(
    @Query('courseSectionId') courseSectionId?: string,
    @Query('academicCycleId') academicCycleId?: string,
  ) {
    return this.teacherAssignmentsService.findActiveSubstitutions(
      courseSectionId,
      academicCycleId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherAssignmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherAssignmentDto: UpdateTeacherAssignmentDto,
  ) {
    return this.teacherAssignmentsService.update(
      id,
      updateTeacherAssignmentDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherAssignmentsService.remove(id);
  }
}
