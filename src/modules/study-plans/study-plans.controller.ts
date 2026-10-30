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
import { StudyPlanService } from './study-plans.service';
import { CreateStudyPlanDto } from './dto/create-study-plans.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plans.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('study-plans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StudyPlanController {
  constructor(private readonly studyPlanService: StudyPlanService) {}

  @Post()
  @Permissions('study-plans.create')
  create(@Body() createStudyPlanDto: CreateStudyPlanDto) {
    return this.studyPlanService.create(createStudyPlanDto);
  }

  @Get()
  @Permissions('study-plans.read')
  findAll() {
    return this.studyPlanService.findAll();
  }

  @Get(':id')
  @Permissions('study-plans.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanService.findOne(id);
  }

  @Patch(':id')
  @Permissions('study-plans.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudyPlanDto: UpdateStudyPlanDto,
  ) {
    return this.studyPlanService.update(id, updateStudyPlanDto);
  }

  @Delete(':id')
  @Permissions('study-plans.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanService.remove(id);
  }
}