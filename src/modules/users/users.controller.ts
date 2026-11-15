import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { UsersService } from './users.service';
import { CreateDashboardUserDto } from './dto/create-dashboard-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/constants/roles';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { ApiErrorResponses, ApiSuccess } from '../../common/swagger/api-docs';

@ApiTags('Users')
@ApiCookieAuth('access_token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un usuario desde el panel de administración',
    description:
      'Crea un usuario nuevo con nombre, apellido, email y roles opcionales. El usuario queda pendiente de activación: se le envía un código de verificación por email. Requiere rol admin.',
  })
  @ApiBody({
    type: CreateDashboardUserDto,
    examples: {
      valido: {
        summary: 'Usuario válido',
        value: {
          first_name: 'Ana',
          last_name: 'Pérez',
          email: 'ana.perez@example.com',
          role_ids: [2],
        },
      },
    },
  })
  @ApiSuccess(201, 'Usuario creado correctamente (cuenta pendiente de activación).', {
    id: 2,
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana.perez@example.com',
    isActive: false,
    isDisabled: false,
    roles: [],
  })
  @ApiErrorResponses({
    access: 'el rol admin',
    badRequest:
      'Datos inválidos: email mal formado, roles inexistentes o inactivos.',
    conflict: 'Ya existe un usuario con ese email.',
  })
  create(@Body() createUserDto: CreateDashboardUserDto) {
    return this.usersService.createFromDashboard(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Devuelve todos los usuarios registrados junto con sus roles. Requiere rol admin.',
  })
  @ApiSuccess(200, 'Listado de usuarios obtenido correctamente.', [
    {
      id: 1,
      firstName: 'Admin',
      lastName: 'Sistema',
      email: 'admin@example.com',
      isActive: true,
      isDisabled: false,
      roles: [{ id: 1, name: 'admin' }],
    },
  ])
  @ApiErrorResponses({ access: 'el rol admin' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar usuario por ID',
    description:
      'Obtiene el detalle de un usuario por su identificador, incluyendo sus roles. Requiere rol admin.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del usuario',
    example: 1,
  })
  @ApiSuccess(200, 'Usuario encontrado correctamente.', {
    id: 1,
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@example.com',
    isActive: true,
    isDisabled: false,
    roles: [{ id: 1, name: 'admin' }],
  })
  @ApiErrorResponses({
    access: 'el rol admin',
    notFound: 'Usuario inexistente con el ID proporcionado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description:
      'Modifica datos del usuario (nombre, apellido, email, contraseña fuera de producción) o su estado (isActive, isDisabled) y roles asignados. Requiere rol admin. No permite reactivar una cuenta sin el flujo de activación, ni quitar rol admin / desactivar al último administrador activo.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del usuario',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      datos: {
        summary: 'Actualizar datos personales',
        value: { first_name: 'Ana María', last_name: 'Pérez' },
      },
      roles: {
        summary: 'Actualizar roles',
        value: { role_ids: [2, 3] },
      },
      deshabilitar: {
        summary: 'Deshabilitar usuario',
        value: { isDisabled: true },
      },
    },
  })
  @ApiSuccess(200, 'Usuario actualizado correctamente.', {
    id: 2,
    firstName: 'Ana María',
    lastName: 'Pérez',
    email: 'ana.perez@example.com',
    isActive: true,
    isDisabled: false,
    roles: [{ id: 2, name: 'docente' }],
  })
  @ApiErrorResponses({
    access: 'el rol admin',
    badRequest:
      'Roles inexistentes o inactivos, o la operación dejaría al sistema sin administradores activos.',
    notFound: 'Usuario inexistente con el ID proporcionado.',
    conflict: 'Ya existe un usuario con ese email.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.update(id, updateUserDto, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar un usuario',
    description:
      'Deshabilita al usuario (isDisabled = true) sin eliminar su registro. Requiere rol admin. No permite desactivar la propia cuenta ni al último administrador activo.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del usuario a desactivar',
    example: 2,
  })
  @ApiSuccess(200, 'Usuario desactivado correctamente.', {
    id: 2,
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana.perez@example.com',
    isDisabled: true,
  })
  @ApiErrorResponses({
    access: 'el rol admin',
    badRequest:
      'No puede desactivar su propia cuenta ni al último administrador activo.',
    notFound: 'Usuario inexistente con el ID proporcionado.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.remove(id, actor.id);
  }
}
