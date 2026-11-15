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
  UseGuards,
} from '@nestjs/common';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('teacher-assignments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeacherAssignmentsController {
  constructor(
    private readonly teacherAssignmentsService: TeacherAssignmentsService,
  ) {}

  @Post()
  @Permissions('teacher-assignments.create')
  create(@Body() createTeacherAssignmentDto: CreateTeacherAssignmentDto) {
    return this.teacherAssignmentsService.create(createTeacherAssignmentDto);
  }

  @Get()
  @Permissions('teacher-assignments.read')
  findAll(@Query('teacherId') teacherId?: string) {
    return this.teacherAssignmentsService.findAll(teacherId);
  }

  @Get('expiring')
  @Permissions('teacher-assignments.read')
  findExpiring(@Query('days') days?: string) {
    return this.teacherAssignmentsService.findExpiring(days);
  }

  @Get('substitutions')
  @Permissions('teacher-assignments.read')
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
  @Permissions('teacher-assignments.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('teacher-assignments.update')
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
  @Permissions('teacher-assignments.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherAssignmentsService.remove(id);
  }
}
