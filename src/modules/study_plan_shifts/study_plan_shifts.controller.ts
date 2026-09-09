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
import { StudyPlanShiftsService } from './study_plan_shifts.service';
import { CreateStudyPlanShiftDto } from './dto/create-study_plan_shift.dto';
import { UpdateStudyPlanShiftDto } from './dto/update-study_plan_shift.dto';

@Controller('study-plan-shifts')
export class StudyPlanShiftsController {
  constructor(private readonly studyPlanShiftsService: StudyPlanShiftsService) {}

  @Post()
  create(@Body() createStudyPlanShiftDto: CreateStudyPlanShiftDto) {
    return this.studyPlanShiftsService.create(createStudyPlanShiftDto);
  }

  @Get()
  findAll() {
    return this.studyPlanShiftsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanShiftsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudyPlanShiftDto: UpdateStudyPlanShiftDto,
  ) {
    return this.studyPlanShiftsService.update(id, updateStudyPlanShiftDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanShiftsService.remove(id);
  }
}
