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
import { ClassHoursService } from './class_hours.service';
import { CreateClassHourDto } from './dto/create-class-hour.dto';
import { UpdateClassHourDto } from './dto/update-class-hour.dto';

@Controller('class-hours')
export class ClassHoursController {
  constructor(private readonly service: ClassHoursService) {}

  @Post()
  create(@Body() dto: CreateClassHourDto) {
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
    @Body() dto: UpdateClassHourDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
