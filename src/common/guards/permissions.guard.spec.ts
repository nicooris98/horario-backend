import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PermissionsGuard } from './permissions.guard';

const mockContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const role = (isActive: boolean, codes: string[]) => ({
  isActive,
  permissions: codes.map((code) => ({ code })),
});

describe('PermissionsGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let findOne: jest.Mock;
  let guard: PermissionsGuard;
  const requestUser = { id: 1, isActive: true };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    findOne = jest.fn();
    const dataSource = { getRepository: () => ({ findOne }) };
    guard = new PermissionsGuard(
      reflector as unknown as Reflector,
      dataSource as unknown as DataSource,
    );
  });

  it('deja pasar si el endpoint no tiene @Permissions', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(mockContext(requestUser))).resolves.toBe(true);
  });

  it('tira 401 si no hay usuario', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles.read']);
    await expect(guard.canActivate(mockContext(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deja pasar si el usuario tiene todos los permisos pedidos', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles.read', 'roles.update']);
    findOne.mockResolvedValue({
      roles: [role(true, ['roles.read', 'roles.update', 'users.read'])],
    });
    await expect(guard.canActivate(mockContext(requestUser))).resolves.toBe(true);
  });

  it('tira 403 si le falta alguno de los permisos', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles.read', 'roles.update']);
    findOne.mockResolvedValue({ roles: [role(true, ['roles.read'])] });
    await expect(guard.canActivate(mockContext(requestUser))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('tira 403 si el permiso viene de un rol inactivo', async () => {
    reflector.getAllAndOverride.mockReturnValue(['roles.read']);
    findOne.mockResolvedValue({ roles: [role(false, ['roles.read'])] });
    await expect(guard.canActivate(mockContext(requestUser))).rejects.toThrow(
      ForbiddenException,
    );
  });
});