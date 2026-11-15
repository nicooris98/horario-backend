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
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemestersService } from './semesters.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('semesters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SemestersController {
  constructor(private readonly service: SemestersService) {}

  @Post()
  @Permissions('semesters.create')
  create(@Body() dto: CreateSemesterDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('semesters.read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('semesters.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('semesters.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSemesterDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('semesters.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
