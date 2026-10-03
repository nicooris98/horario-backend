import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanestudiociclolectivoService } from './planestudiociclolectivo.service';
import { CreatePlanestudiociclolectivoDto } from './dto/create-planestudiociclolectivo.dto';
import { UpdatePlanestudiociclolectivoDto } from './dto/update-planestudiociclolectivo.dto';

@Controller('planestudiociclolectivo')
export class PlanestudiociclolectivoController {
  constructor(private readonly planestudiociclolectivoService: PlanestudiociclolectivoService) {}

  @Post()
  create(@Body() createPlanestudiociclolectivoDto: CreatePlanestudiociclolectivoDto) {
    return this.planestudiociclolectivoService.create(createPlanestudiociclolectivoDto);
  }

  @Get()
  findAll() {
    return this.planestudiociclolectivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planestudiociclolectivoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanestudiociclolectivoDto: UpdatePlanestudiociclolectivoDto) {
    return this.planestudiociclolectivoService.update(+id, updatePlanestudiociclolectivoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planestudiociclolectivoService.remove(+id);
  }
}
