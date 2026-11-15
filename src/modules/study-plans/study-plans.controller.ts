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
import { StudyPlanService } from './study-plans.service';
import { CreateStudyPlanDto } from './dto/create-study-plans.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plans.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Study Plans')
@ApiCookieAuth('access_token')
@Controller('study-plans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StudyPlanController {
  constructor(private readonly studyPlanService: StudyPlanService) {}

  @Post()
  @Permissions('study-plans.create')
  @ApiOperation({
    summary: 'Crear un plan de estudio',
    description:
      'Registra un nuevo plan de estudio asociado a una carrera. Un plan no puede crearse directamente en estado ARCHIVADO. Si se crea como VIGENTE y la carrera ya tiene otro plan vigente, responde 409 con código VIGENTE_EXISTENTE salvo que se envíe replaceCurrentVigente en true (el plan anterior pasa a NO_VIGENTE).',
  })
  @ApiBody({
    type: CreateStudyPlanDto,
    examples: {
      valido: {
        summary: 'Plan de estudio vigente',
        value: {
          name: 'Plan 2026 TDS',
          degreeId: 1,
          durationYears: 3,
          validityYear: 2026,
          startDate: '2026-03-01',
          endDate: null,
          status: 'VIGENTE',
          replaceCurrentVigente: false,
        },
      },
    },
  })
  @ApiSuccess(201, 'Plan de estudio creado correctamente.', {
    id: 2,
    name: 'Plan 2026 TDS',
    durationYears: 3,
    validityYear: 2026,
    startDate: '2026-03-01',
    endDate: null,
    status: 'VIGENTE',
    degree: { id: 1, name: 'Tecnicatura en Desarrollo de Software' },
  })
  @ApiErrorResponses({
    access: 'el permiso study-plans.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: estado ARCHIVADO no permitido en creación, estado fuera de VIGENTE/NO_VIGENTE/ARCHIVADO, o fechas inconsistentes.',
    notFound: 'Carrera inexistente con el ID proporcionado.',
    conflict:
      'La carrera ya tiene un plan vigente (código VIGENTE_EXISTENTE). Reintentar con replaceCurrentVigente: true para reemplazarlo.',
  })
  create(@Body() createStudyPlanDto: CreateStudyPlanDto) {
    return this.studyPlanService.create(createStudyPlanDto);
  }

  @Get()
  @Permissions('study-plans.read')
  @ApiOperation({
    summary: 'Listar planes de estudio',
    description:
      'Devuelve todos los planes de estudio registrados junto con su carrera.',
  })
  @ApiSuccess(200, 'Listado de planes de estudio obtenido correctamente.', [
    {
      id: 1,
      name: 'Plan 2024 TDS',
      durationYears: 3,
      validityYear: 2024,
      startDate: '2024-03-01',
      endDate: null,
      status: 'NO_VIGENTE',
      degree: { id: 1, name: 'Tecnicatura en Desarrollo de Software' },
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso study-plans.read en uno de sus roles activos',
  })
  findAll() {
    return this.studyPlanService.findAll();
  }

  @Get(':id')
  @Permissions('study-plans.read')
  @ApiOperation({
    summary: 'Consultar plan de estudio por ID',
    description:
      'Obtiene el detalle de un plan de estudio por su identificador, incluyendo su carrera.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del plan de estudio',
    example: 1,
  })
  @ApiSuccess(200, 'Plan de estudio encontrado correctamente.', {
    id: 1,
    name: 'Plan 2024 TDS',
    durationYears: 3,
    validityYear: 2024,
    startDate: '2024-03-01',
    endDate: null,
    status: 'NO_VIGENTE',
    degree: { id: 1, name: 'Tecnicatura en Desarrollo de Software' },
  })
  @ApiErrorResponses({
    access: 'el permiso study-plans.read en uno de sus roles activos',
    notFound: 'Plan de estudio inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanService.findOne(id);
  }

  @Patch(':id')
  @Permissions('study-plans.update')
  @ApiOperation({
    summary: 'Actualizar un plan de estudio',
    description:
      'Modifica parcialmente los datos del plan. Las transiciones de estado están restringidas: un plan ARCHIVADO no puede volver a otro estado, y para archivar debe usarse DELETE /study-plans/:id. Si el plan queda VIGENTE y la carrera ya tiene otro vigente, responde 409 salvo replaceCurrentVigente: true.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del plan de estudio',
    example: 1,
  })
  @ApiBody({
    type: UpdateStudyPlanDto,
    examples: {
      parcial: {
        summary: 'Cambio de fecha de fin',
        value: { endDate: '2028-12-31' },
      },
      vigente: {
        summary: 'Pasar a vigente reemplazando al actual',
        value: { status: 'VIGENTE', replaceCurrentVigente: true },
      },
    },
  })
  @ApiSuccess(200, 'Plan de estudio actualizado correctamente.', {
    id: 1,
    name: 'Plan 2024 TDS',
    status: 'VIGENTE',
    degree: { id: 1 },
  })
  @ApiErrorResponses({
    access: 'el permiso study-plans.update en uno de sus roles activos',
    badRequest:
      'Datos inválidos: estado fuera de los valores permitidos o fechas inconsistentes.',
    notFound: 'Plan de estudio o carrera inexistente con el ID proporcionado.',
    conflict:
      'Transición de estado no permitida, plan ya archivado, o la carrera ya tiene un plan vigente (código VIGENTE_EXISTENTE).',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudyPlanDto: UpdateStudyPlanDto,
  ) {
    return this.studyPlanService.update(id, updateStudyPlanDto);
  }

  @Delete(':id')
  @Permissions('study-plans.delete')
  @ApiOperation({
    summary: 'Archivar un plan de estudio (baja lógica)',
    description:
      'Archiva el plan cambiando su estado a ARCHIVADO, sin eliminar físicamente el registro. Falla si el plan ya está archivado o si tiene espacios curriculares (materias) asociados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del plan de estudio a archivar',
    example: 1,
  })
  @ApiSuccess(200, 'Plan de estudio archivado correctamente.', {
    id: 1,
    name: 'Plan 2024 TDS',
    status: 'ARCHIVADO',
  })
  @ApiErrorResponses({
    access: 'el permiso study-plans.delete en uno de sus roles activos',
    notFound: 'Plan de estudio inexistente con el ID proporcionado.',
    conflict:
      'El plan ya está archivado o tiene espacios curriculares (materias) asociados.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlanService.remove(id);
  }
}
