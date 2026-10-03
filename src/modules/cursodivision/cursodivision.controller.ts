import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CursodivisionService } from './cursodivision.service';
import { CreateCursodivisionDto } from './dto/create-cursodivision.dto';
import { UpdateCursodivisionDto } from './dto/update-cursodivision.dto';

@Controller('cursodivision')
export class CursodivisionController {
  constructor(private readonly cursodivisionService: CursodivisionService) {}

  @Post()
  create(@Body() createCursodivisionDto: CreateCursodivisionDto) {
    return this.cursodivisionService.create(createCursodivisionDto);
  }

  @Get()
  findAll() {
    return this.cursodivisionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursodivisionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCursodivisionDto: UpdateCursodivisionDto) {
    return this.cursodivisionService.update(+id, updateCursodivisionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursodivisionService.remove(+id);
  }
}
