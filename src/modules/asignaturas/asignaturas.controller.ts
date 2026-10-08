import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';

@Controller('asignaturas')
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  @Post()
  create(@Body() createAsignaturaDto: CreateAsignaturaDto) {
    return this.asignaturasService.create(createAsignaturaDto);
  }

  @Get()
  findAll() {
    return this.asignaturasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asignaturasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAsignaturaDto: UpdateAsignaturaDto) {
    return this.asignaturasService.update(+id, updateAsignaturaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asignaturasService.remove(+id);
  }
}
