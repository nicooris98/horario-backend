import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EspaciocurricularService } from './espaciocurricular.service';
import { CreateEspaciocurricularDto } from './dto/create-espaciocurricular.dto';
import { UpdateEspaciocurricularDto } from './dto/update-espaciocurricular.dto';

@Controller('espaciocurricular')
export class EspaciocurricularController {
  constructor(private readonly espaciocurricularService: EspaciocurricularService) {}

  @Post()
  create(@Body() createEspaciocurricularDto: CreateEspaciocurricularDto) {
    return this.espaciocurricularService.create(createEspaciocurricularDto);
  }

  @Get()
  findAll() {
    return this.espaciocurricularService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.espaciocurricularService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEspaciocurricularDto: UpdateEspaciocurricularDto) {
    return this.espaciocurricularService.update(+id, updateEspaciocurricularDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.espaciocurricularService.remove(+id);
  }
}
