import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleName } from '../constants/roles';
import { User } from '../../modules/users/entities/user.entity';

const mockContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const userWithRoles = (
  roles: { name: string; isActive: boolean }[],
  isActive = true,
) =>
  ({
    id: 1,
    isActive,
    roles,
  }) as unknown as User;

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('deja pasar si el endpoint no tiene @Roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(mockContext(undefined))).toBe(true);
  });

  it('deja pasar si @Roles está vacío', () => {
    reflector.getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(mockContext(undefined))).toBe(true);
  });

  it('tira 401 si no hay usuario autenticado', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);

    expect(() => guard.canActivate(mockContext(undefined))).toThrow(
      UnauthorizedException,
    );
  });

  it('tira 401 si el usuario está inactivo', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
    const user = userWithRoles([{ name: RoleName.ADMIN, isActive: true }], false);

    expect(() => guard.canActivate(mockContext(user))).toThrow(
      UnauthorizedException,
    );
  });

  it('deja pasar si el usuario tiene alguno de los roles pedidos', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
    const user = userWithRoles([{ name: RoleName.ADMIN, isActive: true }]);

    expect(guard.canActivate(mockContext(user))).toBe(true);
  });

  it('deja pasar si matchea con cualquiera de varios roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue([
      RoleName.ADMIN,
      'docente' as RoleName,
    ]);
    const user = userWithRoles([{ name: 'docente', isActive: true }]);

    expect(guard.canActivate(mockContext(user))).toBe(true);
  });

  it('tira 403 si el rol matchea pero está inactivo', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
    const user = userWithRoles([{ name: RoleName.ADMIN, isActive: false }]);

    expect(() => guard.canActivate(mockContext(user))).toThrow(
      ForbiddenException,
    );
  });

  it('tira 403 si el usuario no tiene ninguno de los roles pedidos', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
    const user = userWithRoles([{ name: 'docente', isActive: true }]);

    expect(() => guard.canActivate(mockContext(user))).toThrow(
      ForbiddenException,
    );
  });

  it('tira 403 si el usuario no tiene roles', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
    const user = userWithRoles([]);

    expect(() => guard.canActivate(mockContext(user))).toThrow(
      ForbiddenException,
    );
  });
});
