import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipocargoService } from './tipocargo.service';
import { CreateTipocargoDto } from './dto/create-tipocargo.dto';
import { UpdateTipocargoDto } from './dto/update-tipocargo.dto';

@Controller('tipocargo')
export class TipocargoController {
  constructor(private readonly tipocargoService: TipocargoService) {}

  @Post()
  create(@Body() createTipocargoDto: CreateTipocargoDto) {
    return this.tipocargoService.create(createTipocargoDto);
  }

  @Get()
  findAll() {
    return this.tipocargoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipocargoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipocargoDto: UpdateTipocargoDto) {
    return this.tipocargoService.update(+id, updateTipocargoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipocargoService.remove(+id);
  }
}
