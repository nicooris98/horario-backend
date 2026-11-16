import {
  Body,
  Controller,
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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Permissions')
@ApiCookieAuth('access_token')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles('admin')
  @Permissions('permissions.create')
  @ApiOperation({
    summary: 'Crear un permiso',
    description:
      'Registra un nuevo permiso del sistema (por ejemplo, teachers.create). Requiere rol admin y el permiso permissions.create.',
  })
  @ApiBody({
    type: CreatePermissionDto,
    examples: {
      valido: {
        summary: 'Permiso válido',
        value: { name: 'Crear docentes', code: 'teachers.create' },
      },
    },
  })
  @ApiSuccess(201, 'Permiso creado correctamente.', {
    id: 45,
    name: 'Crear docentes',
    code: 'teachers.create',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso permissions.create',
    badRequest: 'Datos inválidos: nombre o código vacíos.',
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions('permissions.read')
  @ApiOperation({
    summary: 'Listar permisos',
    description: 'Devuelve todos los permisos registrados en el sistema.',
  })
  @ApiSuccess(200, 'Listado de permisos obtenido correctamente.', [
    {
      id: 1,
      name: 'Crear docentes',
      code: 'teachers.create',
      isActive: true,
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso permissions.read en uno de sus roles activos',
  })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('permissions.read')
  @ApiOperation({
    summary: 'Consultar permiso por ID',
    description: 'Obtiene el detalle de un permiso por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del permiso',
    example: 1,
  })
  @ApiSuccess(200, 'Permiso encontrado correctamente.', {
    id: 1,
    name: 'Crear docentes',
    code: 'teachers.create',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el permiso permissions.read en uno de sus roles activos',
    notFound: 'Permiso inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @Permissions('permissions.update')
  @ApiOperation({
    summary: 'Actualizar un permiso',
    description:
      'Modifica el nombre o código de un permiso. Requiere rol admin y el permiso permissions.update.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del permiso',
    example: 1,
  })
  @ApiBody({
    type: UpdatePermissionDto,
    examples: {
      parcial: {
        summary: 'Cambio de nombre',
        value: { name: 'Crear y editar docentes' },
      },
    },
  })
  @ApiSuccess(200, 'Permiso actualizado correctamente.', {
    id: 1,
    name: 'Crear y editar docentes',
    code: 'teachers.create',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso permissions.update',
    badRequest: 'Datos inválidos en los campos enviados.',
    notFound: 'Permiso inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Patch(':id/activate')
  @Roles('admin')
  @Permissions('permissions.update')
  @ApiOperation({
    summary: 'Activar un permiso',
    description:
      'Marca el permiso como activo (isActive = true). Requiere rol admin y el permiso permissions.update.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del permiso',
    example: 1,
  })
  @ApiSuccess(200, 'Permiso activado correctamente.', {
    id: 1,
    name: 'Crear docentes',
    code: 'teachers.create',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso permissions.update',
    notFound: 'Permiso inexistente con el ID proporcionado.',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  @Permissions('permissions.update')
  @ApiOperation({
    summary: 'Desactivar un permiso',
    description:
      'Marca el permiso como inactivo (isActive = false). Requiere rol admin y el permiso permissions.update.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del permiso',
    example: 1,
  })
  @ApiSuccess(200, 'Permiso desactivado correctamente.', {
    id: 1,
    name: 'Crear docentes',
    code: 'teachers.create',
    isActive: false,
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso permissions.update',
    notFound: 'Permiso inexistente con el ID proporcionado.',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.setActive(id, false);
  }
}
