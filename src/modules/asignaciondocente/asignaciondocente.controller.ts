import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignaciondocenteService } from './asignaciondocente.service';
import { CreateAsignaciondocenteDto } from './dto/create-asignaciondocente.dto';
import { UpdateAsignaciondocenteDto } from './dto/update-asignaciondocente.dto';

@Controller('asignaciondocente')
export class AsignaciondocenteController {
  constructor(private readonly asignaciondocenteService: AsignaciondocenteService) {}

  @Post()
  create(@Body() createAsignaciondocenteDto: CreateAsignaciondocenteDto) {
    return this.asignaciondocenteService.create(createAsignaciondocenteDto);
  }

  @Get()
  findAll() {
    return this.asignaciondocenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asignaciondocenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAsignaciondocenteDto: UpdateAsignaciondocenteDto) {
    return this.asignaciondocenteService.update(+id, updateAsignaciondocenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asignaciondocenteService.remove(+id);
  }
}
