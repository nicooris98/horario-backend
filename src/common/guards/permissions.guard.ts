import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lee la etiqueta puesta con @Permissions() en el metodo o en el controller
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true; // el endpoint no pide permisos
    }

    const requestUser = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>().user;

    if (!requestUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // JwtStrategy carga el usuario con sus roles, pero no los permisos de cada rol.
    // Por eso los buscamos aca: usuario -> roles -> permisos.
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: requestUser.id },
      relations: { roles: { permissions: true } },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Solo cuentan los permisos de los roles ACTIVOS
    const userPermissions = (user?.roles ?? [])
      .filter((role) => role.isActive)
      .flatMap((role) =>
        (role.permissions ?? [])
          .filter((permission) => permission.isActive)
          .map((p) => p.code),
      );

    // Hay que tener TODOS los permisos pedidos
    const hasAll = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta operación',
      );
    }

    return true;
  }
}
