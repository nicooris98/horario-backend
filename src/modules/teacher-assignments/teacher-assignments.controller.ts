import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Teacher Assignments')
@ApiCookieAuth('access_token')
@Controller('teacher-assignments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeacherAssignmentsController {
  constructor(
    private readonly teacherAssignmentsService: TeacherAssignmentsService,
  ) {}

  @Post()
  @Permissions('teacher-assignments.create')
  @ApiOperation({
    summary: 'Crear una asignación docente',
    description:
      'Asigna un docente a una materia dentro de un curso/división, con un tipo de cargo (titular o suplente), horas semanales y período de vigencia. Para registrar una sustitución se envía replacedAssignmentId con la asignación titular que reemplaza. Valida referencias, reglas del tipo de cargo, superposición de asignaciones del docente y consistencia de fechas y horas.',
  })
  @ApiBody({
    type: CreateTeacherAssignmentDto,
    examples: {
      titular: {
        summary: 'Asignación titular',
        value: {
          teacherId: 1,
          positionTypeId: 1,
          courseSectionSubjectId: 1,
          weeklyHours: 6,
          startDate: '2026-03-01',
          endDate: null,
        },
      },
      sustituto: {
        summary: 'Sustitución de un titular',
        value: {
          teacherId: 2,
          positionTypeId: 2,
          replacedAssignmentId: 10,
          courseSectionSubjectId: 1,
          weeklyHours: 6,
          startDate: '2026-05-01',
          endDate: '2026-06-30',
        },
      },
    },
  })
  @ApiSuccess(201, 'Asignación docente creada correctamente.', {
    id: 11,
    teacher: { id: 1 },
    positionType: { id: 1, name: 'Titular' },
    courseSectionSubject: { id: 1 },
    replacedAssignment: null,
    weeklyHours: 6,
    startDate: '2026-03-01',
    endDate: null,
  })
  @ApiErrorResponses({
    access:
      'el permiso teacher-assignments.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: fechas inconsistentes, horas semanales inválidas, el cargo no admite la configuración enviada, la asignación no puede reemplazarse a sí misma, o las referencias no cumplen las reglas del tipo de cargo.',
    notFound:
      'Docente, tipo de cargo, materia en curso o asignación reemplazada inexistente.',
    conflict:
      'La asignación se superpone con otra vigente del mismo docente o no cumple las reglas de sustitución.',
  })
  create(@Body() createTeacherAssignmentDto: CreateTeacherAssignmentDto) {
    return this.teacherAssignmentsService.create(createTeacherAssignmentDto);
  }

  @Get()
  @Permissions('teacher-assignments.read')
  @ApiOperation({
    summary: 'Listar asignaciones docentes',
    description:
      'Devuelve las asignaciones docentes con sus relaciones (docente, tipo de cargo, materia y curso/división). Puede filtrarse por docente.',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    type: Number,
    description: 'Filtrar por identificador de docente',
    example: 1,
  })
  @ApiSuccess(200, 'Listado de asignaciones obtenido correctamente.', [
    {
      id: 11,
      teacher: { id: 1 },
      positionType: { id: 1, name: 'Titular' },
      courseSectionSubject: { id: 1 },
      weeklyHours: 6,
      startDate: '2026-03-01',
      endDate: null,
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso teacher-assignments.read en uno de sus roles activos',
    badRequest: 'teacherId debe ser un entero positivo.',
  })
  findAll(@Query('teacherId') teacherId?: string) {
    return this.teacherAssignmentsService.findAll(teacherId);
  }

  @Get('expiring')
  @Permissions('teacher-assignments.read')
  @ApiOperation({
    summary: 'Listar asignaciones próximas a vencer',
    description:
      'Devuelve las asignaciones cuya fecha de fin cae entre hoy y dentro de la cantidad de días indicada (por defecto una ventana configurable del servicio).',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Días hacia adelante para considerar un vencimiento próximo',
    example: 30,
  })
  @ApiSuccess(
    200,
    'Listado de asignaciones próximas a vencer obtenido correctamente.',
    [
      {
        id: 11,
        teacher: { id: 1 },
        endDate: '2026-12-01',
      },
    ],
  )
  @ApiErrorResponses({
    access: 'el permiso teacher-assignments.read en uno de sus roles activos',
    badRequest: 'days debe ser un entero positivo.',
  })
  findExpiring(@Query('days') days?: string) {
    return this.teacherAssignmentsService.findExpiring(days);
  }

  @Get('substitutions')
  @Permissions('teacher-assignments.read')
  @ApiOperation({
    summary: 'Listar sustituciones vigentes',
    description:
      'Devuelve las asignaciones de sustitución activas hoy (las que reemplazan a un titular), filtrables por curso/división y/o ciclo lectivo.',
  })
  @ApiQuery({
    name: 'courseSectionId',
    required: false,
    type: Number,
    description: 'Filtrar por curso/división',
    example: 5,
  })
  @ApiQuery({
    name: 'academicCycleId',
    required: false,
    type: Number,
    description: 'Filtrar por ciclo lectivo',
    example: 1,
  })
  @ApiSuccess(
    200,
    'Listado de sustituciones vigentes obtenido correctamente.',
    [
      {
        id: 12,
        teacher: { id: 2 },
        replacedAssignment: { id: 11 },
        startDate: '2026-05-01',
        endDate: '2026-06-30',
      },
    ],
  )
  @ApiErrorResponses({
    access: 'el permiso teacher-assignments.read en uno de sus roles activos',
    badRequest:
      'courseSectionId o academicCycleId deben ser enteros positivos.',
  })
  findActiveSubstitutions(
    @Query('courseSectionId') courseSectionId?: string,
    @Query('academicCycleId') academicCycleId?: string,
  ) {
    return this.teacherAssignmentsService.findActiveSubstitutions(
      courseSectionId,
      academicCycleId,
    );
  }

  @Get(':id')
  @Permissions('teacher-assignments.read')
  @ApiOperation({
    summary: 'Consultar asignación por ID',
    description:
      'Obtiene el detalle completo de una asignación docente por su identificador, incluyendo docente, tipo de cargo, materia y asignación reemplazada.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la asignación',
    example: 11,
  })
  @ApiSuccess(200, 'Asignación encontrada correctamente.', {
    id: 11,
    teacher: { id: 1 },
    positionType: { id: 1, name: 'Titular' },
    courseSectionSubject: { id: 1 },
    weeklyHours: 6,
    startDate: '2026-03-01',
    endDate: null,
  })
  @ApiErrorResponses({
    access: 'el permiso teacher-assignments.read en uno de sus roles activos',
    notFound: 'Asignación docente inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('teacher-assignments.update')
  @ApiOperation({
    summary: 'Actualizar una asignación docente',
    description:
      'Modifica parcialmente la asignación (docente, cargo, materia, horas o período). Se revalidan todas las reglas de negocio. Si la asignación tiene sustitutos vigentes, no pueden cambiarse la materia ni las horas semanales.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la asignación',
    example: 11,
  })
  @ApiBody({
    type: UpdateTeacherAssignmentDto,
    examples: {
      cambioDocente: {
        summary: 'Reasignar docente',
        value: { teacherId: 3 },
      },
      cambioPeriodo: {
        summary: 'Extender vigencia',
        value: { endDate: '2026-12-15' },
      },
    },
  })
  @ApiSuccess(200, 'Asignación actualizada correctamente.', {
    id: 11,
    teacher: { id: 3 },
    weeklyHours: 6,
    startDate: '2026-03-01',
    endDate: '2026-12-15',
  })
  @ApiErrorResponses({
    access: 'el permiso teacher-assignments.update en uno de sus roles activos',
    badRequest:
      'Datos inválidos o las reglas del tipo de cargo / fechas / superposición no se cumplen.',
    notFound: 'Asignación o alguna de sus referencias no existe.',
    conflict:
      'La asignación tiene sustitutos vigentes y se intenta cambiar la materia o las horas semanales, o se superpone con otra asignación del docente.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherAssignmentDto: UpdateTeacherAssignmentDto,
  ) {
    return this.teacherAssignmentsService.update(
      id,
      updateTeacherAssignmentDto,
    );
  }

  @Delete(':id')
  @Permissions('teacher-assignments.delete')
  @ApiOperation({
    summary: 'Finalizar una asignación docente',
    description:
      'No elimina la asignación físicamente: le asigna fecha de fin (hoy o su fecha de inicio si aún no comenzó), finalizándola. Falla si ya estaba finalizada.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la asignación a finalizar',
    example: 11,
  })
  @ApiSuccess(200, 'Asignación finalizada correctamente.', {
    id: 11,
    startDate: '2026-03-01',
    endDate: '2026-11-15',
  })
  @ApiErrorResponses({
    access: 'el permiso teacher-assignments.delete en uno de sus roles activos',
    notFound: 'Asignación docente inexistente con el ID proporcionado.',
    conflict: 'La asignación ya finalizó.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherAssignmentsService.remove(id);
  }
}
