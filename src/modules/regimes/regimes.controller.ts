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
import { CreateRegimeDto } from './dto/create-regime.dto';
import { UpdateRegimeDto } from './dto/update-regime.dto';
import { RegimesService } from './regimes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Regimes')
@ApiCookieAuth('access_token')
@Controller('regimes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RegimesController {
  constructor(private readonly service: RegimesService) {}

  @Post()
  @Permissions('regimes.create')
  @ApiOperation({
    summary: 'Crear un régimen de cursado',
    description:
      'Registra un nuevo régimen de cursado (por ejemplo, cuatrimestral o anual) utilizado por las materias.',
  })
  @ApiBody({
    type: CreateRegimeDto,
    examples: {
      valido: { summary: 'Régimen válido', value: { name: 'Cuatrimestral' } },
    },
  })
  @ApiSuccess(201, 'Régimen de cursado creado correctamente.', {
    id: 1,
    name: 'Cuatrimestral',
  })
  @ApiErrorResponses({
    access: 'el permiso regimes.create en uno de sus roles activos',
    badRequest: 'Datos inválidos: el nombre es obligatorio.',
  })
  create(@Body() dto: CreateRegimeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('regimes.read')
  @ApiOperation({
    summary: 'Listar regímenes de cursado',
    description:
      'Devuelve todos los regímenes de cursado registrados.',
  })
  @ApiSuccess(200, 'Listado de regímenes obtenido correctamente.', [
    { id: 1, name: 'Cuatrimestral' },
  ])
  @ApiErrorResponses({
    access: 'el permiso regimes.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('regimes.read')
  @ApiOperation({
    summary: 'Consultar régimen por ID',
    description: 'Obtiene el detalle de un régimen de cursado por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del régimen',
    example: 1,
  })
  @ApiSuccess(200, 'Régimen encontrado correctamente.', {
    id: 1,
    name: 'Cuatrimestral',
  })
  @ApiErrorResponses({
    access: 'el permiso regimes.read en uno de sus roles activos',
    notFound: 'Régimen inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('regimes.update')
  @ApiOperation({
    summary: 'Actualizar un régimen de cursado',
    description:
      'Modifica el nombre del régimen de cursado. Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del régimen',
    example: 1,
  })
  @ApiBody({
    type: UpdateRegimeDto,
    examples: {
      parcial: { summary: 'Renombrar régimen', value: { name: 'Anual' } },
    },
  })
  @ApiSuccess(200, 'Régimen actualizado correctamente.', {
    id: 1,
    name: 'Anual',
  })
  @ApiErrorResponses({
    access: 'el permiso regimes.update en uno de sus roles activos',
    badRequest: 'Datos inválidos: el nombre es obligatorio si se envía.',
    notFound: 'Régimen inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegimeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('regimes.delete')
  @ApiOperation({
    summary: 'Eliminar un régimen de cursado',
    description:
      'Elimina físicamente el régimen. Falla si está en uso por materias existentes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del régimen a eliminar',
    example: 1,
  })
  @ApiSuccess(200, 'Régimen eliminado correctamente.')
  @ApiErrorResponses({
    access: 'el permiso regimes.delete en uno de sus roles activos',
    notFound: 'Régimen inexistente con el ID proporcionado.',
    conflict: 'El régimen está en uso por materias y no se puede eliminar.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
