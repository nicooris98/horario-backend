import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EspaciocurricularcursodivisionService } from './espaciocurricularcursodivision.service';
import { CreateEspaciocurricularcursodivisionDto } from './dto/create-espaciocurricularcursodivision.dto';
import { UpdateEspaciocurricularcursodivisionDto } from './dto/update-espaciocurricularcursodivision.dto';

@Controller('espaciocurricularcursodivision')
export class EspaciocurricularcursodivisionController {
  constructor(private readonly espaciocurricularcursodivisionService: EspaciocurricularcursodivisionService) {}

  @Post()
  create(@Body() createEspaciocurricularcursodivisionDto: CreateEspaciocurricularcursodivisionDto) {
    return this.espaciocurricularcursodivisionService.create(createEspaciocurricularcursodivisionDto);
  }

  @Get()
  findAll() {
    return this.espaciocurricularcursodivisionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.espaciocurricularcursodivisionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEspaciocurricularcursodivisionDto: UpdateEspaciocurricularcursodivisionDto) {
    return this.espaciocurricularcursodivisionService.update(+id, updateEspaciocurricularcursodivisionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.espaciocurricularcursodivisionService.remove(+id);
  }
}
