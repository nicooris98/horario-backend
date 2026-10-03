import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CuatrimestreService } from './cuatrimestre.service';
import { CreateCuatrimestreDto } from './dto/create-cuatrimestre.dto';
import { UpdateCuatrimestreDto } from './dto/update-cuatrimestre.dto';

@Controller('cuatrimestre')
export class CuatrimestreController {
  constructor(private readonly cuatrimestreService: CuatrimestreService) {}

  @Post()
  create(@Body() createCuatrimestreDto: CreateCuatrimestreDto) {
    return this.cuatrimestreService.create(createCuatrimestreDto);
  }

  @Get()
  findAll() {
    return this.cuatrimestreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuatrimestreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCuatrimestreDto: UpdateCuatrimestreDto) {
    return this.cuatrimestreService.update(+id, updateCuatrimestreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cuatrimestreService.remove(+id);
  }
}
