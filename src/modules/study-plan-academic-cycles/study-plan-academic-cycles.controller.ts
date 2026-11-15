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
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStudyPlanAcademicCycleDto } from './dto/create-study-plan-academic-cycle.dto';
import { UpdateStudyPlanAcademicCycleDto } from './dto/update-study-plan-academic-cycle.dto';
import { StudyPlanAcademicCyclesService } from './study-plan-academic-cycles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Study Plan Academic Cycles')
@ApiCookieAuth('access_token')
@Controller('study-plan-academic-cycles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StudyPlanAcademicCyclesController {
  constructor(private readonly service: StudyPlanAcademicCyclesService) {}

  @Post()
  @Permissions('study-plan-academic-cycles.create')
  @ApiOperation({
    summary: 'Crear una combinación plan/ciclo/turno',
    description:
      'Asocia un plan de estudio con un ciclo lectivo y un turno. La combinación (plan, ciclo, turno) debe ser única.',
  })
  @ApiBody({
    type: CreateStudyPlanAcademicCycleDto,
    examples: {
      valido: {
        summary: 'Combinación válida',
        value: { studyPlanId: 1, academicCycleId: 1, shiftId: 1 },
      },
    },
  })
  @ApiSuccess(201, 'Combinación plan/ciclo/turno creada correctamente.', {
    id: 1,
    studyPlan: { id: 1 },
    academicCycle: { id: 1 },
    shift: { id: 1 },
  })
  @ApiErrorResponses({
    access:
      'el permiso study-plan-academic-cycles.create en uno de sus roles activos',
    badRequest: 'Datos inválidos: los tres identificadores son obligatorios.',
    notFound:
      'Plan de estudio, ciclo lectivo o turno inexistente con el ID proporcionado.',
    conflict:
      'Ya existe una combinación con ese plan de estudio, ciclo lectivo y turno.',
  })
  create(@Body() dto: CreateStudyPlanAcademicCycleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('study-plan-academic-cycles.read')
  @ApiOperation({
    summary: 'Listar combinaciones plan/ciclo/turno',
    description:
      'Devuelve todas las combinaciones plan de estudio + ciclo lectivo + turno registradas, con sus relaciones.',
  })
  @ApiSuccess(
    200,
    'Listado de combinaciones obtenido correctamente.',
    [
      {
        id: 1,
        studyPlan: { id: 1 },
        academicCycle: { id: 1 },
        shift: { id: 1 },
      },
    ],
  )
  @ApiErrorResponses({
    access:
      'el permiso study-plan-academic-cycles.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('study-plan-academic-cycles.read')
  @ApiOperation({
    summary: 'Consultar combinación por ID',
    description:
      'Obtiene el detalle de una combinación plan/ciclo/turno por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la combinación',
    example: 1,
  })
  @ApiSuccess(200, 'Combinación encontrada correctamente.', {
    id: 1,
    studyPlan: { id: 1 },
    academicCycle: { id: 1 },
    shift: { id: 1 },
  })
  @ApiErrorResponses({
    access:
      'el permiso study-plan-academic-cycles.read en uno de sus roles activos',
    notFound: 'Combinación inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('study-plan-academic-cycles.update')
  @ApiOperation({
    summary: 'Actualizar una combinación plan/ciclo/turno',
    description:
      'Modifica los componentes de la combinación (plan, ciclo o turno). La nueva combinación también debe ser única.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la combinación',
    example: 1,
  })
  @ApiBody({
    type: UpdateStudyPlanAcademicCycleDto,
    examples: {
      cambioTurno: {
        summary: 'Cambio de turno',
        value: { shiftId: 2 },
      },
    },
  })
  @ApiSuccess(200, 'Combinación actualizada correctamente.', {
    id: 1,
    studyPlan: { id: 1 },
    academicCycle: { id: 1 },
    shift: { id: 2 },
  })
  @ApiErrorResponses({
    access:
      'el permiso study-plan-academic-cycles.update en uno de sus roles activos',
    badRequest: 'Datos inválidos en los identificadores enviados.',
    notFound:
      'Combinación, plan de estudio, ciclo lectivo o turno inexistente.',
    conflict:
      'La nueva combinación ya existe o está en uso por cursos/división.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudyPlanAcademicCycleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('study-plan-academic-cycles.delete')
  @ApiOperation({
    summary: 'Eliminar una combinación plan/ciclo/turno',
    description:
      'Elimina físicamente la combinación. Falla si tiene cursos/división asociados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la combinación a eliminar',
    example: 1,
  })
  @ApiSuccess(200, 'Combinación eliminada correctamente.')
  @ApiErrorResponses({
    access:
      'el permiso study-plan-academic-cycles.delete en uno de sus roles activos',
    notFound: 'Combinación inexistente con el ID proporcionado.',
    conflict:
      'La combinación tiene cursos/división asociados y no se puede eliminar.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
