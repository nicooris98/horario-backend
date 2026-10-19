import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PositionTypesService } from './position-types.service';
import { CreatePositionTypeDto } from './dto/create-position-type.dto';
import { UpdatePositionTypeDto } from './dto/update-position-type.dto';

@Controller('position-types')
export class PositionTypesController {
  constructor(private readonly positionTypesService: PositionTypesService) {}

  @Post()
  create(@Body() createPositionTypeDto: CreatePositionTypeDto) {
    return this.positionTypesService.create(createPositionTypeDto);
  }

  @Get()
  findAll() {
    return this.positionTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.findOne(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.deactivate(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePositionTypeDto: UpdatePositionTypeDto,
  ) {
    return this.positionTypesService.update(id, updatePositionTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.remove(id);
  }
}
