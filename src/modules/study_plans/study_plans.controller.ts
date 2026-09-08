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
import { StudyPlanService } from './study_plans.service';
import { CreateStudyPlanDto } from './dto/create-study_plans.dto';
import { UpdateStudyPlanDto } from './dto/update-study_plans.dto';

@Controller('study-plans')
export class StudyPlanController {
  constructor(private readonly studyPlanService: StudyPlanService) {}

  @Post()
  create(@Body() createStudyPlanDto: CreateStudyPlanDto) {
    return this.studyPlanService.create(createStudyPlanDto);
  }

  @Get()
  findAll() {
    return this.studyPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudyPlanDto: UpdateStudyPlanDto,
  ) {
    return this.studyPlanService.update(id, updateStudyPlanDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanService.remove(id);
  }
}
