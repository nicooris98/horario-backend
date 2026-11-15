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
import { ClassHoursService } from './class-hours.service';
import { CreateClassHourDto } from './dto/create-class-hour.dto';
import { UpdateClassHourDto } from './dto/update-class-hour.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('class-hours')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClassHoursController {
  constructor(private readonly service: ClassHoursService) {}

  @Post()
  @Permissions('class-hours.create')
  create(@Body() dto: CreateClassHourDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('class-hours.read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('class-hours.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('class-hours.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassHourDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('class-hours.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
