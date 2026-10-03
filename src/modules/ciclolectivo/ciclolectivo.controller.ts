import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CiclolectivoService } from './ciclolectivo.service';
import { CreateCiclolectivoDto } from './dto/create-ciclolectivo.dto';
import { UpdateCiclolectivoDto } from './dto/update-ciclolectivo.dto';

@Controller('ciclolectivo')
export class CiclolectivoController {
  constructor(private readonly ciclolectivoService: CiclolectivoService) {}

  @Post()
  create(@Body() createCiclolectivoDto: CreateCiclolectivoDto) {
    return this.ciclolectivoService.create(createCiclolectivoDto);
  }

  @Get()
  findAll() {
    return this.ciclolectivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ciclolectivoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCiclolectivoDto: UpdateCiclolectivoDto) {
    return this.ciclolectivoService.update(+id, updateCiclolectivoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ciclolectivoService.remove(+id);
  }
}
