import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanestudioService } from './planestudio.service';
import { CreatePlanestudioDto } from './dto/create-planestudio.dto';
import { UpdatePlanestudioDto } from './dto/update-planestudio.dto';

@Controller('planestudio')
export class PlanestudioController {
  constructor(private readonly planestudioService: PlanestudioService) {}

  @Post()
  create(@Body() createPlanestudioDto: CreatePlanestudioDto) {
    return this.planestudioService.create(createPlanestudioDto);
  }

  @Get()
  findAll() {
    return this.planestudioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planestudioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanestudioDto: UpdatePlanestudioDto) {
    return this.planestudioService.update(+id, updatePlanestudioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planestudioService.remove(+id);
  }
}
