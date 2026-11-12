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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DegreeService } from './degrees.service';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto } from './dto/update-degrees.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { UpdateDegreeStatusDto } from './dto/update-degrees.dto';

@ApiTags('Degrees')
@ApiBearerAuth()
@Controller('degrees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DegreeController {
  constructor(private readonly degreeService: DegreeService) {}

  @Post()
  @Permissions('degrees.create')
  create(@Body() createDegreeDto: CreateDegreeDto) {
    return this.degreeService.create(createDegreeDto);
  }

  @Get()
  @Permissions('degrees.read')
  findAll() {
    return this.degreeService.findAll();
  }

  @Get(':id')
  @Permissions('degrees.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.degreeService.findOne(id);
  }

  @Patch(':id')
  @Permissions('degrees.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDegreeDto: UpdateDegreeDto,
  ) {
    return this.degreeService.update(id, updateDegreeDto);
  }

    @Patch(':id/status')
    @Permissions('degrees.update')
    updateStatus(
      @Param('id', ParseIntPipe) id: number,
     @Body() dto: UpdateDegreeStatusDto,
  )  {
    return this.degreeService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('degrees.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.degreeService.remove(id);
  }
}