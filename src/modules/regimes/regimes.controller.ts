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
import { CreateRegimeDto } from './dto/create-regime.dto';
import { UpdateRegimeDto } from './dto/update-regime.dto';
import { RegimesService } from './regimes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('regimes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RegimesController {
  constructor(private readonly service: RegimesService) {}

  @Post()
  @Permissions('regimes.create')
  create(@Body() dto: CreateRegimeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('regimes.read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('regimes.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('regimes.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegimeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('regimes.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
