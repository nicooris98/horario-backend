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
import { DegreeService } from './degrees.service';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto, UpdateDegreeStatusDto } from './dto/update-degrees.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Degrees')
@ApiCookieAuth('access_token')
@Controller('degrees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DegreeController {
  constructor(private readonly degreeService: DegreeService) {}

  @Post()
  @Permissions('degrees.create')
  @ApiOperation({
    summary: 'Crear una carrera',
    description:
      'Registra una nueva carrera (título de grado) en el sistema.',
  })
  @ApiBody({
    type: CreateDegreeDto,
    examples: {
      valido: {
        summary: 'Carrera válida',
        value: { name: 'Tecnicatura en Desarrollo de Software' },
      },
    },
  })
  @ApiSuccess(201, 'Carrera creada correctamente.', {
    id: 1,
    name: 'Tecnicatura en Desarrollo de Software',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso degrees.create en uno de sus roles activos',
    badRequest: 'Datos inválidos: el nombre es obligatorio.',
  })
  create(@Body() createDegreeDto: CreateDegreeDto) {
    return this.degreeService.create(createDegreeDto);
  }

  @Get()
  @Permissions('degrees.read')
  @ApiOperation({
    summary: 'Listar carreras',
    description: 'Devuelve todas las carreras registradas.',
  })
  @ApiSuccess(200, 'Listado de carreras obtenido correctamente.', [
    { id: 1, name: 'Tecnicatura en Desarrollo de Software', status: 'ACTIVO' },
  ])
  @ApiErrorResponses({
    access: 'el permiso degrees.read en uno de sus roles activos',
  })
  findAll() {
    return this.degreeService.findAll();
  }

  @Get(':id')
  @Permissions('degrees.read')
  @ApiOperation({
    summary: 'Consultar carrera por ID',
    description: 'Obtiene el detalle de una carrera por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la carrera',
    example: 1,
  })
  @ApiSuccess(200, 'Carrera encontrada correctamente.', {
    id: 1,
    name: 'Tecnicatura en Desarrollo de Software',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso degrees.read en uno de sus roles activos',
    notFound: 'Carrera inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.degreeService.findOne(id);
  }

  @Patch(':id')
  @Permissions('degrees.update')
  @ApiOperation({
    summary: 'Actualizar datos de una carrera',
    description:
      'Modifica los datos generales de la carrera. Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la carrera',
    example: 1,
  })
  @ApiBody({
    type: UpdateDegreeDto,
    examples: {
      parcial: {
        summary: 'Corrección de nombre',
        value: { name: 'Tecnicatura en Desarrollo de Software y Datos' },
      },
    },
  })
  @ApiSuccess(200, 'Carrera actualizada correctamente.', {
    id: 1,
    name: 'Tecnicatura en Desarrollo de Software y Datos',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso degrees.update en uno de sus roles activos',
    badRequest: 'Datos inválidos en los campos enviados.',
    notFound: 'Carrera inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDegreeDto: UpdateDegreeDto,
  ) {
    return this.degreeService.update(id, updateDegreeDto);
  }

  @Patch(':id/status')
  @Permissions('degrees.update')
  @ApiOperation({
    summary: 'Cambiar estado de una carrera',
    description:
      'Actualiza el estado de la carrera. Acepta exclusivamente los valores ACTIVO o INACTIVO. Si el estado enviado es igual al actual, devuelve la carrera sin cambios.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la carrera',
    example: 1,
  })
  @ApiBody({
    type: UpdateDegreeStatusDto,
    examples: {
      desactivar: { summary: 'Desactivar', value: { status: 'INACTIVO' } },
    },
  })
  @ApiSuccess(200, 'Estado de la carrera actualizado correctamente.', {
    id: 1,
    name: 'Tecnicatura en Desarrollo de Software',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso degrees.update en uno de sus roles activos',
    badRequest: 'Estado inválido. Solo se admiten ACTIVO o INACTIVO.',
    notFound: 'Carrera inexistente con el ID proporcionado.',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDegreeStatusDto,
  ) {
    return this.degreeService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Permissions('degrees.delete')
  @ApiOperation({
    summary: 'Desactivar una carrera (baja lógica)',
    description:
      'Realiza una baja lógica cambiando el estado de la carrera a INACTIVO, sin eliminar físicamente el registro.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la carrera a desactivar',
    example: 1,
  })
  @ApiSuccess(200, 'Baja lógica realizada correctamente.', {
    id: 1,
    name: 'Tecnicatura en Desarrollo de Software',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso degrees.delete en uno de sus roles activos',
    notFound: 'Carrera inexistente con el ID proporcionado.',
    conflict: 'La carrera ya se encuentra inactiva.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.degreeService.remove(id);
  }
}
