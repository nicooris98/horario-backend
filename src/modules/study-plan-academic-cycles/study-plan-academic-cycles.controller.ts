import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStudyPlanAcademicCycleDto } from './dto/create-study-plan-academic-cycle.dto';
import { UpdateStudyPlanAcademicCycleDto } from './dto/update-study-plan-academic-cycle.dto';
import { StudyPlanAcademicCyclesService } from './study-plan-academic-cycles.service';

@Controller('study-plan-academic-cycles')
export class StudyPlanAcademicCyclesController {
  constructor(private readonly service: StudyPlanAcademicCyclesService) {}

  @Post()
  create(@Body() dto: CreateStudyPlanAcademicCycleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudyPlanAcademicCycleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
