import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CareersService } from './careers.service';
import { CreateCareersDto } from './dto/create-careers.dto';
import { UpdateCareersDto } from './dto/update-careers.dto';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  create(@Body() createCareersDto: CreateCareersDto) {
    return this.careersService.create(createCareersDto);
  }

  @Get()
  findAll() {
    return this.careersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCareersDto: UpdateCareersDto) {
    return this.careersService.update(+id, updateCareersDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careersService.remove(+id);
  }
}
