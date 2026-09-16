import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ClassPeriodsService } from './class_periods.service';
import { CreateClassPeriodDto } from './dto/create-class-period.dto';
import { UpdateClassPeriodDto } from './dto/update-class-period.dto';

@Controller('class-periods')
export class ClassPeriodsController {
  constructor(private readonly service: ClassPeriodsService) {}
  @Post() create(@Body() dto: CreateClassPeriodDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassPeriodDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
