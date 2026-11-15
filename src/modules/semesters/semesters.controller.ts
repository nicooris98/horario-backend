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
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemestersService } from './semesters.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Semesters')
@ApiCookieAuth('access_token')
@Controller('semesters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SemestersController {
  constructor(private readonly service: SemestersService) {}

  @Post()
  @Permissions('semesters.create')
  @ApiOperation({
    summary: 'Crear un cuatrimestre',
    description:
      'Registra un nuevo cuatrimestre con su nombre, número, fecha de inicio y fecha de fin. La fecha de fin no puede ser anterior a la de inicio.',
  })
  @ApiBody({
    type: CreateSemesterDto,
    examples: {
      valido: {
        summary: 'Cuatrimestre válido',
        value: {
          name: 'Primer cuatrimestre 2026',
          number: 1,
          startDate: '2026-03-01',
          endDate: '2026-07-15',
        },
      },
    },
  })
  @ApiSuccess(201, 'Cuatrimestre creado correctamente.', {
    id: 1,
    name: 'Primer cuatrimestre 2026',
    number: 1,
    startDate: '2026-03-01',
    endDate: '2026-07-15',
  })
  @ApiErrorResponses({
    access: 'el permiso semesters.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: campos obligatorios vacíos o fechas con formato incorrecto o rango invertido.',
  })
  create(@Body() dto: CreateSemesterDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions('semesters.read')
  @ApiOperation({
    summary: 'Listar cuatrimestres',
    description: 'Devuelve todos los cuatrimestres registrados.',
  })
  @ApiSuccess(200, 'Listado de cuatrimestres obtenido correctamente.', [
    {
      id: 1,
      name: 'Primer cuatrimestre 2026',
      number: 1,
      startDate: '2026-03-01',
      endDate: '2026-07-15',
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso semesters.read en uno de sus roles activos',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('semesters.read')
  @ApiOperation({
    summary: 'Consultar cuatrimestre por ID',
    description: 'Obtiene el detalle de un cuatrimestre por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del cuatrimestre',
    example: 1,
  })
  @ApiSuccess(200, 'Cuatrimestre encontrado correctamente.', {
    id: 1,
    name: 'Primer cuatrimestre 2026',
    number: 1,
    startDate: '2026-03-01',
    endDate: '2026-07-15',
  })
  @ApiErrorResponses({
    access: 'el permiso semesters.read en uno de sus roles activos',
    notFound: 'Cuatrimestre inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('semesters.update')
  @ApiOperation({
    summary: 'Actualizar un cuatrimestre',
    description:
      'Modifica parcialmente los datos del cuatrimestre (nombre, número, fechas). Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del cuatrimestre',
    example: 1,
  })
  @ApiBody({
    type: UpdateSemesterDto,
    examples: {
      parcial: {
        summary: 'Corrección de fecha de fin',
        value: { endDate: '2026-07-20' },
      },
    },
  })
  @ApiSuccess(200, 'Cuatrimestre actualizado correctamente.', {
    id: 1,
    name: 'Primer cuatrimestre 2026',
    number: 1,
    startDate: '2026-03-01',
    endDate: '2026-07-20',
  })
  @ApiErrorResponses({
    access: 'el permiso semesters.update en uno de sus roles activos',
    badRequest: 'Datos inválidos o fecha de fin anterior a la de inicio.',
    notFound: 'Cuatrimestre inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSemesterDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('semesters.delete')
  @ApiOperation({
    summary: 'Eliminar un cuatrimestre',
    description:
      'Elimina físicamente el cuatrimestre. Falla si está en uso por horarios existentes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del cuatrimestre a eliminar',
    example: 1,
  })
  @ApiSuccess(200, 'Cuatrimestre eliminado correctamente.')
  @ApiErrorResponses({
    access: 'el permiso semesters.delete en uno de sus roles activos',
    notFound: 'Cuatrimestre inexistente con el ID proporcionado.',
    conflict:
      'El cuatrimestre está en uso por horarios y no se puede eliminar.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
