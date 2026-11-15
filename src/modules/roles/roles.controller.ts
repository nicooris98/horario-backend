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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Roles')
@ApiCookieAuth('access_token')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('roles.create')
  @ApiOperation({
    summary: 'Crear un rol',
    description:
      'Registra un nuevo rol con su nombre, descripción opcional y estado activo.',
  })
  @ApiBody({
    type: CreateRoleDto,
    examples: {
      valido: {
        summary: 'Rol válido',
        value: {
          name: 'secretaria',
          description: 'Gestión de trámites académicos',
          isActive: true,
        },
      },
    },
  })
  @ApiSuccess(201, 'Rol creado correctamente.', {
    id: 3,
    name: 'secretaria',
    description: 'Gestión de trámites académicos',
    isActive: true,
    permissions: [],
  })
  @ApiErrorResponses({
    access: 'el permiso roles.create en uno de sus roles activos',
    badRequest:
      'Datos inválidos: nombre vacío o campos con formato incorrecto.',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('roles.read')
  @ApiOperation({
    summary: 'Listar roles',
    description: 'Devuelve todos los roles registrados en el sistema.',
  })
  @ApiSuccess(200, 'Listado de roles obtenido correctamente.', [
    {
      id: 1,
      name: 'admin',
      description: 'Administrador del sistema',
      isActive: true,
      permissions: [],
    },
  ])
  @ApiErrorResponses({
    access: 'el permiso roles.read en uno de sus roles activos',
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('roles.read')
  @ApiOperation({
    summary: 'Consultar rol por ID',
    description: 'Obtiene el detalle de un rol por su identificador.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiSuccess(200, 'Rol encontrado correctamente.', {
    id: 1,
    name: 'admin',
    description: 'Administrador del sistema',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el permiso roles.read en uno de sus roles activos',
    notFound: 'Rol inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Get(':id/permissions')
  @Permissions('roles.read')
  @ApiOperation({
    summary: 'Consultar rol con sus permisos',
    description:
      'Obtiene el rol junto con la colección completa de permisos que tiene asignados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiSuccess(200, 'Rol con permisos encontrado correctamente.', {
    id: 1,
    name: 'admin',
    isActive: true,
    permissions: [{ id: 1, name: 'Crear docentes', code: 'teachers.create' }],
  })
  @ApiErrorResponses({
    access: 'el permiso roles.read en uno de sus roles activos',
    notFound: 'Rol inexistente con el ID proporcionado.',
  })
  findOneWithPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOneWithPermissions(id);
  }

  @Patch(':id')
  @Permissions('roles.update')
  @ApiOperation({
    summary: 'Actualizar un rol',
    description:
      'Modifica parcialmente los datos del rol (nombre, descripción, estado). Solo se actualizan los campos enviados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiBody({
    type: UpdateRoleDto,
    examples: {
      parcial: {
        summary: 'Cambio de descripción',
        value: { description: 'Gestión administrativa general' },
      },
    },
  })
  @ApiSuccess(200, 'Rol actualizado correctamente.', {
    id: 1,
    name: 'admin',
    description: 'Gestión administrativa general',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el permiso roles.update en uno de sus roles activos',
    badRequest: 'Datos inválidos en los campos enviados.',
    notFound: 'Rol inexistente con el ID proporcionado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/activate')
  @Roles('admin')
  @Permissions('roles.update')
  @ApiOperation({
    summary: 'Activar un rol',
    description:
      'Marca el rol como activo (isActive = true). Requiere rol admin y el permiso roles.update.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiSuccess(200, 'Rol activado correctamente.', {
    id: 3,
    name: 'secretaria',
    isActive: true,
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso roles.update',
    notFound: 'Rol inexistente con el ID proporcionado.',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  @Permissions('roles.update')
  @ApiOperation({
    summary: 'Desactivar un rol',
    description:
      'Marca el rol como inactivo (isActive = false). Requiere rol admin y el permiso roles.update.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiSuccess(200, 'Rol desactivado correctamente.', {
    id: 3,
    name: 'secretaria',
    isActive: false,
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso roles.update',
    notFound: 'Rol inexistente con el ID proporcionado.',
  })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.setActive(id, false);
  }

  @Post(':id/permissions/:permissionId')
  @Roles('admin')
  @Permissions('roles.assign_permission')
  @ApiOperation({
    summary: 'Asignar un permiso a un rol',
    description:
      'Agrega el permiso indicado a la colección de permisos del rol. Requiere rol admin y el permiso roles.assign_permission.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiParam({
    name: 'permissionId',
    type: Number,
    description: 'Identificador único del permiso a asignar',
    example: 45,
  })
  @ApiSuccess(200, 'Permiso asignado al rol correctamente.', {
    id: 1,
    name: 'secretaria',
    permissions: [{ id: 45, code: 'teachers.create' }],
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso roles.assign_permission',
    notFound: 'Rol o permiso inexistente con el ID proporcionado.',
  })
  addPermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.addPermission(id, permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  @Roles('admin')
  @Permissions('roles.assign_permission')
  @ApiOperation({
    summary: 'Quitar un permiso de un rol',
    description:
      'Elimina el permiso indicado de la colección de permisos del rol. Requiere rol admin y el permiso roles.assign_permission.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del rol',
    example: 1,
  })
  @ApiParam({
    name: 'permissionId',
    type: Number,
    description: 'Identificador único del permiso a quitar',
    example: 45,
  })
  @ApiSuccess(200, 'Permiso quitado del rol correctamente.', {
    id: 1,
    name: 'secretaria',
    permissions: [],
  })
  @ApiErrorResponses({
    access: 'el rol admin y el permiso roles.assign_permission',
    notFound: 'Rol inexistente con el ID proporcionado.',
  })
  removePermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.removePermission(id, permissionId);
  }
}
