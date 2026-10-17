import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
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

  let inTransaction = false;

  const txManager = {
    find: jest.fn((_entity, { where }) => {
      if (!inTransaction) {
        return Promise.reject(new Error('find fuera de la transaccion'));
      }
      return Promise.resolve(
        (where.id.value as number[])
          .map((roleId) => roles[roleId])
          .filter(Boolean),
      );
    }),
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
      transaction: jest.fn(async (cb) => {
        inTransaction = true;
        try {
          return await cb(txManager);
        } finally {
          inTransaction = false;
        }
      }),
    },
  };
  const roleRepository = { findBy: jest.fn() };
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

    it('valida los roles dentro de la transaccion con bloqueo FOR SHARE', async () => {
      await service.createFromDashboard({ ...createDto, role_ids: [2, 1, 2] });

      expect(roleRepository.findBy).not.toHaveBeenCalled();
      expect(txManager.find).toHaveBeenCalledTimes(1);
      const [entity, options] = txManager.find.mock.calls[0];
      expect(entity).toBe(Role);
      expect(options.lock).toEqual({ mode: 'pessimistic_read' });
      expect(options.where.id.value).toEqual([2, 1]);
      expect(txManager.find.mock.invocationCallOrder[0]).toBeLessThan(
        txManager.save.mock.invocationCallOrder[0],
      );
    });

    it('no asigna un rol desactivado justo antes de leerlo en la transaccion', async () => {
      txManager.find.mockResolvedValueOnce([
        { id: 1, name: 'ADMIN', isActive: false },
      ]);
      await expect(
        service.createFromDashboard({ ...createDto, role_ids: [1] }),
      ).rejects.toThrow('Roles inactivos: ADMIN');
      expectNoWrites();
    });

    it('mantiene el 409 si el email ya existe', async () => {
      userRepository.findOne.mockResolvedValueOnce({ id: 5 });
      await expect(
        service.createFromDashboard({ ...createDto, role_ids: [1] }),
      ).rejects.toThrow(ConflictException);
      expect(userRepository.manager.transaction).not.toHaveBeenCalled();
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

    it('valida los roles dentro de la transaccion con bloqueo FOR SHARE', async () => {
      await service.update(10, { role_ids: [1] });

      expect(roleRepository.findBy).not.toHaveBeenCalled();
      expect(txManager.find).toHaveBeenCalledWith(
        Role,
        expect.objectContaining({ lock: { mode: 'pessimistic_read' } }),
      );
      expect(txManager.find.mock.invocationCallOrder[0]).toBeLessThan(
        txManager.save.mock.invocationCallOrder[0],
      );
    });

    it('propaga errores de la consulta de roles dentro de la transaccion', async () => {
      txManager.find.mockRejectedValueOnce(new Error('lock timeout'));
      await expect(service.update(10, { role_ids: [1] })).rejects.toThrow(
        'lock timeout',
      );
      expectNoWrites();
    });

    it('mantiene el 404 si el usuario no existe', async () => {
      await expect(service.update(77, { role_ids: [1] })).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.manager.transaction).not.toHaveBeenCalled();
      expectNoWrites();
    });
  });
});

describe('Concurrencia entre asignacion y desactivacion de roles', () => {
  // Simula los bloqueos de fila de Postgres: FOR SHARE es compartido y
  // FOR UPDATE espera a que se liberen todos los FOR SHARE (y viceversa).
  const createDb = () => {
    const role = { id: 1, name: 'ADMIN', isActive: true };
    const events: string[] = [];
    let sharedHolders = 0;
    let exclusive = false;
    const waiters: Array<() => void> = [];
    const wake = () => waiters.splice(0).forEach((w) => w());
    const acquire = async (mode: string) => {
      while (mode === 'pessimistic_read' ? exclusive : exclusive || sharedHolders > 0) {
        await new Promise<void>((resolve) => waiters.push(resolve));
      }
      if (mode === 'pessimistic_read') sharedHolders++;
      else exclusive = true;
    };

    const transaction = async (cb: (m: EntityManager) => Promise<unknown>) => {
      const held: string[] = [];
      const manager = {
        create: (_e: unknown, data: object) => ({ ...data }),
        find: async (_e: unknown, opts: { lock: { mode: string } }) => {
          await acquire(opts.lock.mode);
          held.push(opts.lock.mode);
          events.push('assign:roles-locked');
          return [{ ...role }];
        },
        findOne: async (_e: unknown, opts: { lock: { mode: string } }) => {
          await acquire(opts.lock.mode);
          held.push(opts.lock.mode);
          events.push('deactivate:role-locked');
          return { ...role };
        },
        save: async (_e: unknown, entity: { roles?: unknown; isActive: boolean }) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          if (entity.roles) {
            events.push('assign:user-saved');
            return { id: 10, ...entity };
          }
          role.isActive = entity.isActive;
          events.push('deactivate:role-saved');
          return entity;
        },
      } as unknown as EntityManager;
      try {
        return await cb(manager);
      } finally {
        held.forEach((mode) => {
          if (mode === 'pessimistic_read') sharedHolders--;
          else exclusive = false;
        });
        wake();
      }
    };
    return { role, events, transaction };
  };

  it('la desactivacion espera a que termine la asignacion en curso', async () => {
    const db = createDb();
    const userRepository = {
      findOne: jest.fn(({ where }) =>
        Promise.resolve(
          where.email !== undefined
            ? null
            : { id: 10, roles: [{ ...db.role, isActive: false }] },
        ),
      ),
      manager: { transaction: db.transaction },
    };
    const usersService = new UsersService(
      userRepository as unknown as Repository<User>,
      {} as Repository<Role>,
    );
    const rolesService = new RolesService(
      { manager: { transaction: db.transaction } } as unknown as Repository<Role>,
      {} as PermissionsService,
    );

    const assign = usersService.createFromDashboard({
      first_name: 'Ana',
      last_name: 'Perez',
      email: 'ana@test.com',
      password: 'secreta123',
      role_ids: [1],
    });
    // Esperar a que la asignacion tome el bloqueo FOR SHARE
    while (!db.events.includes('assign:roles-locked')) {
      await new Promise((resolve) => setImmediate(resolve));
    }
    const deactivate = rolesService.setActive(1, false);

    await Promise.all([assign, deactivate]);

    expect(db.events).toEqual([
      'assign:roles-locked',
      'assign:user-saved',
      'deactivate:role-locked',
      'deactivate:role-saved',
    ]);
  });

  it('una asignacion posterior a la desactivacion ve el rol inactivo y se rechaza', async () => {
    const db = createDb();
    const usersService = new UsersService(
      {
        findOne: jest.fn().mockResolvedValue(null),
        manager: { transaction: db.transaction },
      } as unknown as Repository<User>,
      {} as Repository<Role>,
    );
    const rolesService = new RolesService(
      { manager: { transaction: db.transaction } } as unknown as Repository<Role>,
      {} as PermissionsService,
    );

    await rolesService.setActive(1, false);
    await expect(
      usersService.createFromDashboard({
        first_name: 'Ana',
        last_name: 'Perez',
        email: 'ana@test.com',
        password: 'secreta123',
        role_ids: [1],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(db.events).not.toContain('assign:user-saved');
  });
});
