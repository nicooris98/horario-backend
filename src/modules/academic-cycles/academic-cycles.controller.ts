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
import { AcademicCyclesService } from './academic-cycles.service';
import { CreateAcademicCycleDto } from './dto/create-academic-cycle.dto';
import { UpdateAcademicCycleDto } from './dto/update-academic-cycle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Academic Cycles')
@ApiCookieAuth('access_token')
@Controller('academic-cycles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AcademicCyclesController {
  constructor(private readonly service: AcademicCyclesService) {}

  @Post()
  @Permissions('academic-cycles.create')
  @ApiOperation({
    summary: 'Crear un ciclo lectivo',
    description:
      'Registra un nuevo ciclo lectivo académico con su año, fecha de inicio y fecha de fin. La fecha de fin no puede ser anterior a la de inicio.',
  })
  @ApiBody({
    type: CreateAcademicCycleDto,
    examples: {
      valido: {
        summary: 'Ciclo lectivo válido',
        value: { year: 2026, startDate: '2026-03-01', endDate: '2026-11-30' },
      },
    },
  })
  @ApiSuccess(201, 'Ciclo lectivo creado correctamente.', {
    id: 3,
    year: 2026,
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso academic-cycles.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: año no entero positivo o fechas con formato incorrecto o rango invertido.',
  })
  create(@Body() dto: CreateAcademicCycleDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('academic-cycles.read')
  @ApiOperation({
    summary: 'Listar ciclos lectivos',
    description:
      'Devuelve todos los ciclos lectivos registrados, ordenados por identificador.',
  })
  @ApiSuccess(200, 'Listado de ciclos lectivos obtenido correctamente.', [
    {
      id: 1,
      year: 2025,
      startDate: '2025-03-01',
      endDate: '2025-11-30',
      status: 'ACTIVO',
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso academic-cycles.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('academic-cycles.read')
  @ApiOperation({
    summary: 'Consultar ciclo lectivo por ID',
    description: 'Obtiene el detalle de un ciclo lectivo por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del ciclo lectivo',
    example: 1,
  })
  @ApiSuccess(200, 'Ciclo lectivo encontrado correctamente.', {
    id: 1,
    year: 2025,
    startDate: '2025-03-01',
    endDate: '2025-11-30',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso academic-cycles.read en uno de sus roles activos',
    notFound: 'Ciclo lectivo inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('academic-cycles.update')
  @ApiOperation({
    summary: 'Actualizar datos de un ciclo lectivo',
    description:
      'Modifica parcialmente los datos del ciclo lectivo (año, fechas). Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del ciclo lectivo',
    example: 1,
  })
  @ApiBody({
    type: UpdateAcademicCycleDto,
    examples: {
      parcial: {
        summary: 'Actualización parcial',
        value: { endDate: '2025-12-15' },
      },
    },
  })
  @ApiSuccess(200, 'Ciclo lectivo actualizado correctamente.', {
    id: 1,
    year: 2025,
    startDate: '2025-03-01',
    endDate: '2025-12-15',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso academic-cycles.update en uno de sus roles activos',
    badRequest: 'Datos inválidos o fecha de fin anterior a la de inicio.',
    notFound: 'Ciclo lectivo inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicCycleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions('academic-cycles.update')
  @ApiOperation({
    summary: 'Cambiar estado de un ciclo lectivo',
    description:
      'Actualiza el estado del ciclo lectivo. Acepta exclusivamente los valores ACTIVO o INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del ciclo lectivo',
    example: 1,
  })
  @ApiBody({
    type: UpdateStatusDto,
    examples: {
      desactivar: { summary: 'Desactivar', value: { status: 'INACTIVO' } },
      activar: { summary: 'Activar', value: { status: 'ACTIVO' } },
    },
  })
  @ApiSuccess(200, 'Estado del ciclo lectivo actualizado correctamente.', {
    id: 1,
    year: 2025,
    startDate: '2025-03-01',
    endDate: '2025-11-30',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso academic-cycles.update en uno de sus roles activos',
    badRequest: 'Estado inválido. Solo se admiten ACTIVO o INACTIVO.',
    notFound: 'Ciclo lectivo inexistente con el ID proporcionado.',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('academic-cycles.delete')
  @ApiOperation({
    summary: 'Desactivar un ciclo lectivo (baja lógica)',
    description:
      'Realiza una baja lógica cambiando el estado del ciclo lectivo a INACTIVO, sin eliminar físicamente el registro.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del ciclo lectivo a desactivar',
    example: 1,
  })
  @ApiSuccess(200, 'Baja lógica realizada correctamente.', {
    id: 1,
    year: 2025,
    startDate: '2025-03-01',
    endDate: '2025-11-30',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso academic-cycles.delete en uno de sus roles activos',
    notFound: 'Ciclo lectivo inexistente con el ID proporcionado.',
    conflict: 'El ciclo lectivo ya se encuentra inactivo.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
