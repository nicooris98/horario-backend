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
import { PositionTypesService } from './position-types.service';
import { CreatePositionTypeDto } from './dto/create-position-type.dto';
import { UpdatePositionTypeDto } from './dto/update-position-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Position Types')
@ApiCookieAuth('access_token')
@Controller('position-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PositionTypesController {
  constructor(private readonly positionTypesService: PositionTypesService) {}

  @Post()
  @Permissions('position-types.create')
  @ApiOperation({
    summary: 'Crear un tipo de cargo',
    description:
      'Registra un nuevo tipo de cargo docente (por ejemplo, titular o suplente). El nombre debe ser único sin distinguir mayúsculas. Si el tipo admite suplentes, las asignaciones de ese cargo podrán tener docente sustituto.',
  })
  @ApiBody({
    type: CreatePositionTypeDto,
    examples: {
      valido: {
        summary: 'Tipo de cargo válido',
        value: {
          name: 'Titular',
          description: 'Docente titular de la asignatura',
          allowsSubstitute: true,
          status: 'ACTIVO',
        },
      },
    },
  })
  @ApiSuccess(201, 'Tipo de cargo creado correctamente.', {
    id: 1,
    name: 'Titular',
    description: 'Docente titular de la asignatura',
    allowsSubstitute: true,
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso position-types.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: nombre vacío, allowsSubstitute no booleano o status fuera de los valores permitidos.',
    conflict: 'Ya existe un tipo de cargo con ese nombre.',
  })
  create(@Body() createPositionTypeDto: CreatePositionTypeDto) {
    return this.positionTypesService.create(createPositionTypeDto);
  }

  @Get()
  @Permissions('position-types.read')
  @ApiOperation({
    summary: 'Listar tipos de cargo',
    description: 'Devuelve todos los tipos de cargo registrados.',
  })
  @ApiSuccess(200, 'Listado de tipos de cargo obtenido correctamente.', [
    {
      id: 1,
      name: 'Titular',
      description: 'Docente titular de la asignatura',
      allowsSubstitute: true,
      status: 'ACTIVO',
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso position-types.read en uno de sus roles activos',
  })
  findAll() {
    return this.positionTypesService.findAll();
  }

  @Get(':id')
  @Permissions('position-types.read')
  @ApiOperation({
    summary: 'Consultar tipo de cargo por ID',
    description: 'Obtiene el detalle de un tipo de cargo por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del tipo de cargo',
    example: 1,
  })
  @ApiSuccess(200, 'Tipo de cargo encontrado correctamente.', {
    id: 1,
    name: 'Titular',
    description: 'Docente titular de la asignatura',
    allowsSubstitute: true,
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso position-types.read en uno de sus roles activos',
    notFound: 'Tipo de cargo inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.findOne(id);
  }

  @Patch(':id/deactivate')
  @Permissions('position-types.update')
  @ApiOperation({
    summary: 'Desactivar un tipo de cargo',
    description:
      'Cambia el estado del tipo de cargo a INACTIVO sin eliminar el registro.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del tipo de cargo',
    example: 1,
  })
  @ApiSuccess(200, 'Tipo de cargo desactivado correctamente.', {
    id: 1,
    name: 'Titular',
    allowsSubstitute: true,
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso position-types.update en uno de sus roles activos',
    notFound: 'Tipo de cargo inexistente con el ID proporcionado.',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.deactivate(id);
  }

  @Patch(':id')
  @Permissions('position-types.update')
  @ApiOperation({
    summary: 'Actualizar un tipo de cargo',
    description:
      'Modifica parcialmente los datos del tipo de cargo (nombre, descripción, admite suplentes, estado). El nombre debe seguir siendo único.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del tipo de cargo',
    example: 1,
  })
  @ApiBody({
    type: UpdatePositionTypeDto,
    examples: {
      parcial: {
        summary: 'Cambio de descripción',
        value: { description: 'Cargo de apoyo académico' },
      },
    },
  })
  @ApiSuccess(200, 'Tipo de cargo actualizado correctamente.', {
    id: 1,
    name: 'Titular',
    description: 'Cargo de apoyo académico',
    allowsSubstitute: true,
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso position-types.update en uno de sus roles activos',
    badRequest:
      'Datos inválidos: allowsSubstitute no booleano o status fuera de los valores permitidos.',
    notFound: 'Tipo de cargo inexistente con el ID proporcionado.',
    conflict: 'Ya existe un tipo de cargo con ese nombre.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePositionTypeDto: UpdatePositionTypeDto,
  ) {
    return this.positionTypesService.update(id, updatePositionTypeDto);
  }

  @Delete(':id')
  @Permissions('position-types.delete')
  @ApiOperation({
    summary: 'Desactivar un tipo de cargo (baja lógica)',
    description:
      'Realiza una baja lógica cambiando el estado del tipo de cargo a INACTIVO, sin eliminar físicamente el registro.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del tipo de cargo a desactivar',
    example: 1,
  })
  @ApiSuccess(200, 'Baja lógica realizada correctamente.', {
    id: 1,
    name: 'Titular',
    allowsSubstitute: true,
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso position-types.delete en uno de sus roles activos',
    notFound: 'Tipo de cargo inexistente con el ID proporcionado.',
    conflict: 'El tipo de cargo ya se encuentra inactivo.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionTypesService.remove(id);
  }
}
