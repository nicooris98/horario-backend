import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PositionTypesService } from './position-types.service';
import { CreatePositionTypeDto } from './dto/create-position-type.dto';
import { UpdatePositionTypeDto } from './dto/update-position-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('position-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PositionTypesController {
  constructor(private readonly positionTypesService: PositionTypesService) {}

  @Post()
  @Permissions('position-types.create')
  create(@Body() createPositionTypeDto: CreatePositionTypeDto) {
    return this.positionTypesService.create(createPositionTypeDto);
  }

  @Get()
  @Permissions('position-types.read')
  findAll() {
    return this.positionTypesService.findAll();
  }

  @Get(':id')
  @Permissions('position-types.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.findOne(id);
  }

  @Patch(':id/deactivate')
  @Permissions('position-types.update')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.deactivate(id);
  }

  @Patch(':id')
  @Permissions('position-types.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePositionTypeDto: UpdatePositionTypeDto,
  ) {
    return this.positionTypesService.update(id, updatePositionTypeDto);
  }

  @Delete(':id')
  @Permissions('position-types.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.remove(id);
  }
}
