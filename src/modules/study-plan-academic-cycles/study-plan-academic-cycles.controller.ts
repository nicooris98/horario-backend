import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateStudyPlanAcademicCycleDto } from './dto/create-study-plan-academic-cycle.dto';
import { UpdateStudyPlanAcademicCycleDto } from './dto/update-study-plan-academic-cycle.dto';
import { StudyPlanAcademicCyclesService } from './study-plan-academic-cycles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('study-plan-academic-cycles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StudyPlanAcademicCyclesController {
  constructor(private readonly service: StudyPlanAcademicCyclesService) {}

  @Post()
  @Permissions('study-plan-academic-cycles.create')
  create(@Body() dto: CreateStudyPlanAcademicCycleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('study-plan-academic-cycles.read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('study-plan-academic-cycles.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('study-plan-academic-cycles.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudyPlanAcademicCycleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('study-plan-academic-cycles.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
