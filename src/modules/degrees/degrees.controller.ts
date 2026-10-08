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
import { DegreeService } from './degrees.service';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto } from './dto/update-degrees.dto';

@Controller('degrees')
export class DegreeController {
  constructor(private readonly degreeService: DegreeService) {}

  @Post()
  create(@Body() createDegreeDto: CreateDegreeDto) {
    return this.degreeService.create(createDegreeDto);
  }

  @Get()
  findAll() {
    return this.degreeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.degreeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDegreeDto: UpdateDegreeDto,
  ) {
    return this.degreeService.update(id, updateDegreeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.degreeService.remove(id);
  }
}
