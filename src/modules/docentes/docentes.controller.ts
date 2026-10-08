import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { Docente } from './entities/docente.entity'; // Importá la entidad

@Controller('docentes')
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  @Get()
  findAll(): Promise<Docente[]> {
    return this.docentesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Docente | null> {
    return this.docentesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDocenteDto): Promise<Docente> {
    return this.docentesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateDocenteDto): Promise<Docente | null> {
    return this.docentesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.docentesService.remove(id);
  }
}
