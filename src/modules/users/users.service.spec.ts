import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';

describe('UsersService - asignación de roles', () => {
  const roles: Record<number, Partial<Role>> = {
    1: { id: 1, name: 'ADMIN', isActive: true },
    2: { id: 2, name: 'DOCENTE', isActive: true },
    3: { id: 3, name: 'prueba2', isActive: false },
  };

  let storedUser: Partial<User> | null;

  const txManager = {
    create: jest.fn((_entity, data) => ({ ...data })),
    save: jest.fn((_entity, user) => Promise.resolve({ id: 10, ...user })),
  };
  const userRepository = {
    findOne: jest.fn(({ where }) => {
      if (where.email !== undefined) return Promise.resolve(null);
      return Promise.resolve(
        storedUser && where.id === storedUser.id ? { ...storedUser } : null,
      );
    }),
    save: jest.fn(),
    manager: {
      transaction: jest.fn((cb) => cb(txManager)),
    },
  };
  const roleRepository = {
    findBy: jest.fn(({ id }) =>
      Promise.resolve(
        (id.value as number[]).map((roleId) => roles[roleId]).filter(Boolean),
      ),
    ),
  };
  const service = new UsersService(
    userRepository as unknown as Repository<User>,
    roleRepository as unknown as Repository<Role>,
  );

  const createDto = {
    first_name: 'Ana',
    last_name: 'Pérez',
    email: 'ana@test.com',
    password: 'secreta123',
  };

  const expectNoWrites = () => {
    expect(userRepository.manager.transaction).not.toHaveBeenCalled();
    expect(txManager.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storedUser = {
      id: 10,
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@test.com',
      isActive: true,
      roles: [roles[2] as Role],
    };
  });

  describe('createFromDashboard', () => {
    it('crea el usuario con todos los roles válidos y activos', async () => {
      await service.createFromDashboard({ ...createDto, role_ids: [1, 2] });

      expect(userRepository.manager.transaction).toHaveBeenCalledTimes(1);
      expect(txManager.save).toHaveBeenCalledTimes(1);
      const saved = txManager.save.mock.calls[0][1];
      expect(saved.roles.map((r: Role) => r.id)).toEqual([1, 2]);
      expect(saved.password).not.toBe(createDto.password);
    });

    it('rechaza un rol inexistente con 400', async () => {
      const error = await service
        .createFromDashboard({ ...createDto, role_ids: [99] })
        .catch((e) => e);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getStatus()).toBe(400);
      expect(error.message).toBe('Roles inexistentes: 99');
      expectNoWrites();
    });

    it('rechaza un rol inactivo con 400', async () => {
      const error = await service
        .createFromDashboard({ ...createDto, role_ids: [3] })
        .catch((e) => e);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Roles inactivos: prueba2');
      expectNoWrites();
    });

    it('rechaza una lista que mezcla roles válidos e inválidos', async () => {
      await expect(
        service.createFromDashboard({ ...createDto, role_ids: [1, 2, 99] }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createFromDashboard({ ...createDto, role_ids: [1, 3] }),
      ).rejects.toThrow('Roles inactivos: prueba2');
      expectNoWrites();
    });

    it('propaga el error y no deja usuario si falla la escritura en la transacción', async () => {
      txManager.save.mockRejectedValueOnce(new Error('db error'));
      await expect(
        service.createFromDashboard({ ...createDto, role_ids: [1] }),
      ).rejects.toThrow('db error');
      expect(userRepository.manager.transaction).toHaveBeenCalledTimes(1);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('mantiene el 409 si el email ya existe', async () => {
      userRepository.findOne.mockResolvedValueOnce({ id: 5 });
      await expect(
        service.createFromDashboard({ ...createDto, role_ids: [1] }),
      ).rejects.toThrow(ConflictException);
      expectNoWrites();
    });
  });

  describe('update', () => {
    it('actualiza datos y roles válidos y activos en una transacción', async () => {
      await service.update(10, { first_name: 'Ana María', role_ids: [1, 2] });

      expect(userRepository.manager.transaction).toHaveBeenCalledTimes(1);
      const saved = txManager.save.mock.calls[0][1];
      expect(saved.firstName).toBe('Ana María');
      expect(saved.roles.map((r: Role) => r.id)).toEqual([1, 2]);
    });

    it('rechaza un rol inexistente con 400 sin modificar nada', async () => {
      const error = await service
        .update(10, { first_name: 'Otro', role_ids: [1, 99] })
        .catch((e) => e);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Roles inexistentes: 99');
      expectNoWrites();
    });

    it('rechaza un rol inactivo con 400 sin modificar nada', async () => {
      const error = await service
        .update(10, { first_name: 'Otro', role_ids: [2, 3] })
        .catch((e) => e);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        message: 'Roles inactivos: prueba2',
        error: 'Bad Request',
        statusCode: 400,
      });
      expectNoWrites();
    });

    it('propaga el error si falla la escritura en la transacción', async () => {
      txManager.save.mockRejectedValueOnce(new Error('db error'));
      await expect(
        service.update(10, { first_name: 'Otro', role_ids: [1] }),
      ).rejects.toThrow('db error');
      expect(userRepository.manager.transaction).toHaveBeenCalledTimes(1);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('mantiene el 404 si el usuario no existe', async () => {
      await expect(service.update(77, { role_ids: [1] })).rejects.toThrow(
        NotFoundException,
      );
      expectNoWrites();
    });
  });
});