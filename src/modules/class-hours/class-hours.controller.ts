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
import { ClassHoursService } from './class-hours.service';
import { CreateClassHourDto } from './dto/create-class-hour.dto';
import { UpdateClassHourDto } from './dto/update-class-hour.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Class Hours')
@ApiCookieAuth('access_token')
@Controller('class-hours')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClassHoursController {
  constructor(private readonly service: ClassHoursService) {}

  @Post()
  @Permissions('class-hours.create')
  @ApiOperation({
    summary: 'Crear una hora cátedra',
    description:
      'Registra una franja horaria de clase con su número de slot y rango horario. La hora de fin debe ser posterior a la de inicio.',
  })
  @ApiBody({
    type: CreateClassHourDto,
    examples: {
      valido: {
        summary: 'Franja horaria válida',
        value: { slotNumber: 1, startTime: '08:00', endTime: '09:30' },
      },
    },
  })
  @ApiSuccess(201, 'Hora cátedra creada correctamente.', {
    id: 1,
    slotNumber: 1,
    startTime: '08:00:00',
    endTime: '09:30:00',
  })
  @ApiErrorResponses({
    access: 'el permiso class-hours.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: slotNumber no entero positivo, horario con formato incorrecto o endTime no posterior a startTime.',
  })
  create(@Body() dto: CreateClassHourDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('class-hours.read')
  @ApiOperation({
    summary: 'Listar horas cátedra',
    description: 'Devuelve todas las franjas horarias de clase registradas.',
  })
  @ApiSuccess(200, 'Listado de horas cátedra obtenido correctamente.', [
    { id: 1, slotNumber: 1, startTime: '08:00:00', endTime: '09:30:00' },
  ])
  @ApiErrorResponses({
    access: 'el permiso class-hours.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('class-hours.read')
  @ApiOperation({
    summary: 'Consultar hora cátedra por ID',
    description:
      'Obtiene el detalle de una franja horaria por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la hora cátedra',
    example: 1,
  })
  @ApiSuccess(200, 'Hora cátedra encontrada correctamente.', {
    id: 1,
    slotNumber: 1,
    startTime: '08:00:00',
    endTime: '09:30:00',
  })
  @ApiErrorResponses({
    access: 'el permiso class-hours.read en uno de sus roles activos',
    notFound: 'Hora cátedra inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('class-hours.update')
  @ApiOperation({
    summary: 'Actualizar una hora cátedra',
    description:
      'Modifica parcialmente la franja horaria (número de slot, hora de inicio y fin). Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la hora cátedra',
    example: 1,
  })
  @ApiBody({
    type: UpdateClassHourDto,
    examples: {
      parcial: {
        summary: 'Cambio de franja horaria',
        value: { startTime: '08:00', endTime: '10:00' },
      },
    },
  })
  @ApiSuccess(200, 'Hora cátedra actualizada correctamente.', {
    id: 1,
    slotNumber: 1,
    startTime: '08:00:00',
    endTime: '10:00:00',
  })
  @ApiErrorResponses({
    access: 'el permiso class-hours.update en uno de sus roles activos',
    badRequest: 'Datos inválidos o endTime no posterior a startTime.',
    notFound: 'Hora cátedra inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassHourDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('class-hours.delete')
  @ApiOperation({
    summary: 'Eliminar una hora cátedra',
    description:
      'Elimina físicamente la franja horaria. Falla si está en uso por horarios existentes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la hora cátedra a eliminar',
    example: 1,
  })
  @ApiSuccess(200, 'Hora cátedra eliminada correctamente.')
  @ApiErrorResponses({
    access: 'el permiso class-hours.delete en uno de sus roles activos',
    notFound: 'Hora cátedra inexistente con el ID proporcionado.',
    conflict:
      'La hora cátedra está en uso por horarios y no se puede eliminar.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
