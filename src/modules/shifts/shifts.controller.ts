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
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Shifts')
@ApiCookieAuth('access_token')
@Controller('shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Post()
  @Permissions('shifts.create')
  @ApiOperation({
    summary: 'Crear un turno',
    description:
      'Registra un nuevo turno con su nombre y rango horario. La hora de fin debe ser posterior a la de inicio.',
  })
  @ApiBody({
    type: CreateShiftDto,
    examples: {
      valido: {
        summary: 'Turno válido',
        value: { name: 'Mañana', startTime: '08:00', endTime: '13:00' },
      },
    },
  })
  @ApiSuccess(201, 'Turno creado correctamente.', {
    id: 1,
    name: 'Mañana',
    startTime: '08:00:00',
    endTime: '13:00:00',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso shifts.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: nombre vacío, horario con formato incorrecto o endTime no posterior a startTime.',
  })
  create(@Body() dto: CreateShiftDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('shifts.read')
  @ApiOperation({
    summary: 'Listar turnos',
    description: 'Devuelve todos los turnos registrados.',
  })
  @ApiSuccess(200, 'Listado de turnos obtenido correctamente.', [
    {
      id: 1,
      name: 'Mañana',
      startTime: '08:00:00',
      endTime: '13:00:00',
      status: 'ACTIVO',
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso shifts.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('shifts.read')
  @ApiOperation({
    summary: 'Consultar turno por ID',
    description: 'Obtiene el detalle de un turno por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del turno',
    example: 1,
  })
  @ApiSuccess(200, 'Turno encontrado correctamente.', {
    id: 1,
    name: 'Mañana',
    startTime: '08:00:00',
    endTime: '13:00:00',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso shifts.read en uno de sus roles activos',
    notFound: 'Turno inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('shifts.update')
  @ApiOperation({
    summary: 'Actualizar un turno',
    description:
      'Modifica parcialmente los datos del turno (nombre, horarios). Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del turno',
    example: 1,
  })
  @ApiBody({
    type: UpdateShiftDto,
    examples: {
      parcial: {
        summary: 'Cambio de horario de fin',
        value: { endTime: '14:00' },
      },
    },
  })
  @ApiSuccess(200, 'Turno actualizado correctamente.', {
    id: 1,
    name: 'Mañana',
    startTime: '08:00:00',
    endTime: '14:00:00',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso shifts.update en uno de sus roles activos',
    badRequest:
      'Datos inválidos o endTime no posterior a startTime.',
    notFound: 'Turno inexistente con el ID proporcionado.',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShiftDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions('shifts.update')
  @ApiOperation({
    summary: 'Cambiar estado de un turno',
    description:
      'Actualiza el estado del turno. Acepta exclusivamente los valores ACTIVO o INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del turno',
    example: 1,
  })
  @ApiBody({
    type: UpdateStatusDto,
    examples: {
      desactivar: { summary: 'Desactivar', value: { status: 'INACTIVO' } },
    },
  })
  @ApiSuccess(200, 'Estado del turno actualizado correctamente.', {
    id: 1,
    name: 'Mañana',
    startTime: '08:00:00',
    endTime: '13:00:00',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso shifts.update en uno de sus roles activos',
    badRequest: 'Estado inválido. Solo se admiten ACTIVO o INACTIVO.',
    notFound: 'Turno inexistente con el ID proporcionado.',
  })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('shifts.delete')
  @ApiOperation({
    summary: 'Desactivar un turno (baja lógica)',
    description:
      'Realiza una baja lógica cambiando el estado del turno a INACTIVO, sin eliminar físicamente el registro.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del turno a desactivar',
    example: 1,
  })
  @ApiSuccess(200, 'Baja lógica realizada correctamente.', {
    id: 1,
    name: 'Mañana',
    startTime: '08:00:00',
    endTime: '13:00:00',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso shifts.delete en uno de sus roles activos',
    notFound: 'Turno inexistente con el ID proporcionado.',
    conflict: 'El turno ya se encuentra inactivo.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
