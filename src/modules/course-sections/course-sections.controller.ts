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
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { CourseSectionsService } from './course-sections.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Course Sections')
@ApiCookieAuth('access_token')
@Controller('course-sections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CourseSectionsController {
  constructor(private readonly service: CourseSectionsService) {}

  @Post()
  @Permissions('course-sections.create')
  @ApiOperation({
    summary: 'Crear un curso/división',
    description:
      'Registra una nueva división de curso asociada a una combinación plan de estudio + ciclo lectivo + turno, con su año de cursado y letra de división.',
  })
  @ApiBody({
    type: CreateCourseSectionDto,
    examples: {
      valido: {
        summary: 'Curso/división válido',
        value: {
          studyPlanAcademicCycleId: 1,
          courseYear: 2,
          section: 'A',
        },
      },
    },
  })
  @ApiSuccess(201, 'Curso/división creado correctamente.', {
    id: 10,
    courseYear: 2,
    section: 'A',
    status: 'ACTIVO',
    studyPlanAcademicCycle: { id: 1 },
  })
  @ApiErrorResponses({
    access:
      'el permiso course-sections.create en uno de sus roles activos',
    badRequest: 'Datos inválidos: identificadores o campos con formato incorrecto.',
    notFound:
      'La combinación plan/ciclo/turno (studyPlanAcademicCycleId) no existe.',
  })
  create(@Body() dto: CreateCourseSectionDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('course-sections.read')
  @ApiOperation({
    summary: 'Listar cursos/divisiones',
    description:
      'Devuelve todos los cursos/divisiones registrados junto con su combinación plan de estudio, ciclo lectivo y turno.',
  })
  @ApiSuccess(200, 'Listado de cursos/divisiones obtenido correctamente.', [
    {
      id: 10,
      courseYear: 2,
      section: 'A',
      status: 'ACTIVO',
      studyPlanAcademicCycle: { id: 1 },
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso course-sections.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('course-sections.read')
  @ApiOperation({
    summary: 'Consultar curso/división por ID',
    description:
      'Obtiene el detalle de un curso/división por su identificador, incluyendo su combinación plan/ciclo/turno.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del curso/división',
    example: 10,
  })
  @ApiSuccess(200, 'Curso/división encontrado correctamente.', {
    id: 10,
    courseYear: 2,
    section: 'A',
    status: 'ACTIVO',
    studyPlanAcademicCycle: { id: 1 },
  })
  @ApiErrorResponses({
    access: 'el permiso course-sections.read en uno de sus roles activos',
    notFound: 'Curso/división inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('course-sections.update')
  @ApiOperation({
    summary: 'Actualizar datos de un curso/división',
    description:
      'Modifica parcialmente los datos del curso/división (año de cursado, letra de división, combinación plan/ciclo/turno). Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del curso/división',
    example: 10,
  })
  @ApiBody({
    type: UpdateCourseSectionDto,
    examples: {
      parcial: {
        summary: 'Cambio de división',
        value: { section: 'B' },
      },
    },
  })
  @ApiSuccess(200, 'Curso/división actualizado correctamente.', {
    id: 10,
    courseYear: 2,
    section: 'B',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso course-sections.update en uno de sus roles activos',
    badRequest: 'Datos inválidos o combinación plan/ciclo/turno inexistente.',
    notFound: 'Curso/división inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseSectionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions('course-sections.update')
  @ApiOperation({
    summary: 'Cambiar estado de un curso/división',
    description:
      'Actualiza el estado del curso/división. Acepta exclusivamente los valores ACTIVO o INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del curso/división',
    example: 10,
  })
  @ApiBody({
    type: UpdateStatusDto,
    examples: {
      desactivar: { summary: 'Desactivar', value: { status: 'INACTIVO' } },
    },
  })
  @ApiSuccess(200, 'Estado del curso/división actualizado correctamente.', {
    id: 10,
    courseYear: 2,
    section: 'A',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso course-sections.update en uno de sus roles activos',
    badRequest: 'Estado inválido. Solo se admiten ACTIVO o INACTIVO.',
    notFound: 'Curso/división inexistente con el ID proporcionado.',
  })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('course-sections.delete')
  @ApiOperation({
    summary: 'Desactivar un curso/división (baja lógica)',
    description:
      'Realiza una baja lógica cambiando el estado del curso/división a INACTIVO, sin eliminar físicamente el registro.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del curso/división a desactivar',
    example: 10,
  })
  @ApiSuccess(200, 'Baja lógica realizada correctamente.', {
    id: 10,
    courseYear: 2,
    section: 'A',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso course-sections.delete en uno de sus roles activos',
    notFound: 'Curso/división inexistente con el ID proporcionado.',
    conflict: 'El curso/división ya se encuentra inactivo.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
