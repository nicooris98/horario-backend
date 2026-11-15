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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Schedules')
@ApiCookieAuth('access_token')
@Controller('schedules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Permissions('schedules.create')
  @ApiOperation({
    summary: 'Crear un horario',
    description:
      'Registra un bloque de horario para una materia en un curso/división, cuatrimestre, franja horaria y día. Valida que no exista superposición con otros horarios del mismo curso/división en el período indicado.',
  })
  @ApiBody({
    type: CreateScheduleDto,
    examples: {
      valido: {
        summary: 'Horario válido',
        value: {
          idCursado: 1,
          idCuatrimestre: 1,
          idHoraCatedra: 1,
          idDia: 1,
          fechaDesde: '2026-03-01',
          fechaHasta: '2026-07-15',
        },
      },
    },
  })
  @ApiSuccess(201, 'Horario creado correctamente.', {
    id: 1,
    courseSectionSubject: { id: 1 },
    semester: { id: 1 },
    classHour: { id: 1 },
    day: { id: 1, name: 'Lunes' },
    startDate: '2026-03-01',
    endDate: '2026-07-15',
  })
  @ApiErrorResponses({
    access: 'el permiso schedules.create en uno de sus roles activos',
    badRequest: 'Datos inválidos o referencias inexistentes.',
    notFound:
      'Alguna de las referencias (materia en curso, cuatrimestre, hora cátedra o día) no existe.',
    conflict:
      'El horario se superpone con otro horario existente del mismo curso/división en el período indicado.',
  })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @Permissions('schedules.read')
  @ApiOperation({
    summary: 'Listar horarios',
    description:
      'Devuelve todos los horarios registrados con sus relaciones (materia, cuatrimestre, franja horaria y día).',
  })
  @ApiSuccess(200, 'Listado de horarios obtenido correctamente.', [
    {
      id: 1,
      courseSectionSubject: { id: 1 },
      semester: { id: 1 },
      classHour: { id: 1 },
      day: { id: 1, name: 'Lunes' },
      startDate: '2026-03-01',
      endDate: '2026-07-15',
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso schedules.read en uno de sus roles activos',
  })
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @Permissions('schedules.read')
  @ApiOperation({
    summary: 'Consultar horario por ID',
    description:
      'Obtiene el detalle de un horario por su identificador, incluyendo todas sus relaciones.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del horario',
    example: 1,
  })
  @ApiSuccess(200, 'Horario encontrado correctamente.', {
    id: 1,
    courseSectionSubject: { id: 1 },
    semester: { id: 1 },
    classHour: { id: 1 },
    day: { id: 1, name: 'Lunes' },
    startDate: '2026-03-01',
    endDate: '2026-07-15',
  })
  @ApiErrorResponses({
    access: 'el permiso schedules.read en uno de sus roles activos',
    notFound: 'Horario inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('schedules.update')
  @ApiOperation({
    summary: 'Actualizar un horario',
    description:
      'Modifica parcialmente los datos del horario (materia, cuatrimestre, franja, día o período). Valida nuevamente que no haya superposición con otros horarios.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del horario',
    example: 1,
  })
  @ApiBody({
    type: UpdateScheduleDto,
    examples: {
      cambioDia: {
        summary: 'Mover a otro día',
        value: { idDia: 2 },
      },
    },
  })
  @ApiSuccess(200, 'Horario actualizado correctamente.', {
    id: 1,
    day: { id: 2, name: 'Martes' },
    startDate: '2026-03-01',
    endDate: '2026-07-15',
  })
  @ApiErrorResponses({
    access: 'el permiso schedules.update en uno de sus roles activos',
    badRequest: 'Datos inválidos o referencias inexistentes.',
    notFound: 'Horario o alguna de sus referencias no existe.',
    conflict:
      'El horario actualizado se superpone con otro horario del mismo curso/división.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @Permissions('schedules.delete')
  @ApiOperation({
    summary: 'Finalizar un horario',
    description:
      'No elimina el horario físicamente: le asigna fecha de fin (hoy o su fecha de inicio si aún no comenzó), marcándolo como finalizado. Falla si ya estaba finalizado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del horario a finalizar',
    example: 1,
  })
  @ApiSuccess(200, 'Horario finalizado correctamente.', {
    id: 1,
    startDate: '2026-03-01',
    endDate: '2026-11-15',
  })
  @ApiErrorResponses({
    access: 'el permiso schedules.delete en uno de sus roles activos',
    notFound: 'Horario inexistente con el ID proporcionado.',
    conflict: 'El horario ya está finalizado.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}
