import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { AcademicCyclesService } from './academic-cycles.service';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('academic-cycles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AcademicCyclesController {
  constructor(private readonly service: AcademicCyclesService) {}
  @Post() @Permissions('academic-cycles.create') create(@Body() dto: CreateAcademicCycleDto) { return this.service.create(dto); }
  @Get() @Permissions('academic-cycles.read') findAll() { return this.service.findAll(); }
  @Get(':id') @Permissions('academic-cycles.read') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') @Permissions('academic-cycles.update') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAcademicCycleDto) { return this.service.update(id, dto); }
  @Patch(':id/status') @Permissions('academic-cycles.update') updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) { return this.service.updateStatus(id, dto); }
  @Delete(':id') @Permissions('academic-cycles.delete') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
