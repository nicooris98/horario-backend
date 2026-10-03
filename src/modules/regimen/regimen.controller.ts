import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegimenService } from './regimen.service';
import { CreateRegimanDto } from './dto/create-regiman.dto';
import { UpdateRegimanDto } from './dto/update-regiman.dto';

@Controller('regimen')
export class RegimenController {
  constructor(private readonly regimenService: RegimenService) {}

  @Post()
  create(@Body() createRegimanDto: CreateRegimanDto) {
    return this.regimenService.create(createRegimanDto);
  }

  @Get()
  findAll() {
    return this.regimenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regimenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegimanDto: UpdateRegimanDto) {
    return this.regimenService.update(+id, updateRegimanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regimenService.remove(+id);
  }
}
