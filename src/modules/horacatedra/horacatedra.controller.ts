import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HoracatedraService } from './horacatedra.service';
import { CreateHoracatedraDto } from './dto/create-horacatedra.dto';
import { UpdateHoracatedraDto } from './dto/update-horacatedra.dto';

@Controller('horacatedra')
export class HoracatedraController {
  constructor(private readonly horacatedraService: HoracatedraService) {}

  @Post()
  create(@Body() createHoracatedraDto: CreateHoracatedraDto) {
    return this.horacatedraService.create(createHoracatedraDto);
  }

  @Get()
  findAll() {
    return this.horacatedraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.horacatedraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHoracatedraDto: UpdateHoracatedraDto) {
    return this.horacatedraService.update(+id, updateHoracatedraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.horacatedraService.remove(+id);
  }
}
