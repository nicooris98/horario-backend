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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Teachers')
@ApiCookieAuth('access_token')
@Controller('teachers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Permissions('teachers.create')
  @ApiOperation({
    summary: 'Crear un docente',
    description:
      'Registra un nuevo docente. El DNI debe tener 7 u 8 dígitos (se ignoran puntos) y ser único. Se exige al menos un dato de contacto (teléfono o email).',
  })
  @ApiBody({
    type: CreateTeacherDto,
    examples: {
      valido: {
        summary: 'Docente válido',
        value: {
          dni: '30123456',
          firstName: 'María',
          lastName: 'González',
          phone: '2615551234',
          email: 'maria.gonzalez@example.com',
          fileNumber: 1024,
          status: 'ACTIVO',
        },
      },
    },
  })
  @ApiSuccess(201, 'Docente creado correctamente.', {
    id: 1,
    dni: '30123456',
    firstName: 'María',
    lastName: 'González',
    phone: '2615551234',
    email: 'maria.gonzalez@example.com',
    fileNumber: 1024,
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso teachers.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: DNI sin 7 u 8 dígitos, email mal formado, falta de datos de contacto o status fuera de los valores permitidos.',
    conflict: 'Ya existe un docente con ese DNI.',
  })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @Permissions('teachers.read')
  @ApiOperation({
    summary: 'Buscar docentes',
    description:
      'Devuelve docentes filtrados opcionalmente por DNI y/o apellido. Sin parámetros devuelve el listado completo.',
  })
  @ApiQuery({
    name: 'dni',
    required: false,
    type: String,
    description: 'DNI del docente a buscar',
    example: '30123456',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    type: String,
    description: 'Apellido del docente a buscar',
    example: 'González',
  })
  @ApiSuccess(200, 'Docentes encontrados correctamente.', [
    {
      id: 1,
      dni: '30123456',
      firstName: 'María',
      lastName: 'González',
      phone: '2615551234',
      email: 'maria.gonzalez@example.com',
      fileNumber: 1024,
      status: 'ACTIVO',
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso teachers.read en uno de sus roles activos',
  })
  findAll(@Query('dni') dni?: string, @Query('lastName') lastName?: string) {
    return this.teachersService.search(dni, lastName);
  }

  @Get(':id')
  @Permissions('teachers.read')
  @ApiOperation({
    summary: 'Consultar docente por ID',
    description: 'Obtiene el detalle de un docente por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del docente',
    example: 1,
  })
  @ApiSuccess(200, 'Docente encontrado correctamente.', {
    id: 1,
    dni: '30123456',
    firstName: 'María',
    lastName: 'González',
    phone: '2615551234',
    email: 'maria.gonzalez@example.com',
    fileNumber: 1024,
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso teachers.read en uno de sus roles activos',
    notFound: 'Docente inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id/deactivate')
  @Permissions('teachers.update')
  @ApiOperation({
    summary: 'Desactivar un docente',
    description:
      'Cambia el estado del docente a INACTIVO sin eliminar el registro ni sus asignaciones históricas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del docente',
    example: 1,
  })
  @ApiSuccess(200, 'Docente desactivado correctamente.', {
    id: 1,
    dni: '30123456',
    firstName: 'María',
    lastName: 'González',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso teachers.update en uno de sus roles activos',
    notFound: 'Docente inexistente con el ID proporcionado.',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.deactivate(id);
  }

  @Patch(':id')
  @Permissions('teachers.update')
  @ApiOperation({
    summary: 'Actualizar un docente',
    description:
      'Modifica parcialmente los datos del docente (DNI, nombre, apellido, contacto, legajo, estado). El DNI debe seguir siendo único.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del docente',
    example: 1,
  })
  @ApiBody({
    type: UpdateTeacherDto,
    examples: {
      parcial: {
        summary: 'Cambio de teléfono',
        value: { phone: '2615559999' },
      },
    },
  })
  @ApiSuccess(200, 'Docente actualizado correctamente.', {
    id: 1,
    dni: '30123456',
    firstName: 'María',
    lastName: 'González',
    phone: '2615559999',
    status: 'ACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso teachers.update en uno de sus roles activos',
    badRequest:
      'Datos inválidos: DNI sin 7 u 8 dígitos, email mal formado o status fuera de los valores permitidos.',
    notFound: 'Docente inexistente con el ID proporcionado.',
    conflict: 'Ya existe otro docente con ese DNI.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Permissions('teachers.delete')
  @ApiOperation({
    summary: 'Desactivar un docente (baja lógica)',
    description:
      'Realiza una baja lógica cambiando el estado del docente a INACTIVO, sin eliminar físicamente el registro ni las asignaciones asociadas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del docente a desactivar',
    example: 1,
  })
  @ApiSuccess(200, 'Baja lógica realizada correctamente.', {
    id: 1,
    dni: '30123456',
    firstName: 'María',
    lastName: 'González',
    status: 'INACTIVO',
  })
  @ApiErrorResponses({
    access: 'el permiso teachers.delete en uno de sus roles activos',
    notFound: 'Docente inexistente con el ID proporcionado.',
    conflict: 'El docente ya se encuentra inactivo.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }
}
