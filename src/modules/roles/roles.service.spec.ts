import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';

describe('RolesService.setActive', () => {
  const txManager = {
    findOne: jest.fn(),
    save: jest.fn((_entity, role) => Promise.resolve(role)),
  };
  const roleRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    manager: { transaction: jest.fn((cb) => cb(txManager)) },
  };
  const service = new RolesService(
    roleRepository as unknown as Repository<Role>,
    {} as PermissionsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('desactiva un rol', async () => {
    txManager.findOne.mockResolvedValue({
      id: 1,
      name: 'docente',
      isActive: true,
    });
    const role = await service.setActive(1, false);
    expect(role.isActive).toBe(false);
    expect(txManager.save).toHaveBeenCalledWith(
      Role,
      expect.objectContaining({ isActive: false }),
    );
    expect(roleRepository.save).not.toHaveBeenCalled();
  });

  it('activa un rol', async () => {
    txManager.findOne.mockResolvedValue({
      id: 1,
      name: 'docente',
      isActive: false,
    });
    const role = await service.setActive(1, true);
    expect(role.isActive).toBe(true);
  });

  it('tira 404 si el rol no existe', async () => {
    txManager.findOne.mockResolvedValue(null);
    await expect(service.setActive(99, true)).rejects.toThrow(
      NotFoundException,
    );
    expect(txManager.save).not.toHaveBeenCalled();
  });

  it('bloquea la fila del rol con FOR UPDATE dentro de una transaccion', async () => {
    txManager.findOne.mockResolvedValue({
      id: 1,
      name: 'docente',
      isActive: true,
    });
    await service.setActive(1, false);
    expect(roleRepository.manager.transaction).toHaveBeenCalledTimes(1);
    expect(txManager.findOne).toHaveBeenCalledWith(Role, {
      where: { id: 1 },
      lock: { mode: 'pessimistic_write' },
    });
    expect(roleRepository.findOne).not.toHaveBeenCalled();
  });

  it('propaga el error de escritura para que la transaccion se revierta', async () => {
    txManager.findOne.mockResolvedValue({
      id: 1,
      name: 'docente',
      isActive: true,
    });
    txManager.save.mockRejectedValueOnce(new Error('db error'));
    await expect(service.setActive(1, false)).rejects.toThrow('db error');
  });

  it('rechaza desactivar el rol admin', async () => {
    txManager.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      isActive: true,
    });

    await expect(service.setActive(1, false)).rejects.toThrow(
      ConflictException,
    );
    expect(txManager.save).not.toHaveBeenCalled();
  });

  it('permite reactivar el rol admin', async () => {
    txManager.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      isActive: false,
    });
    const role = await service.setActive(1, true);
    expect(role.isActive).toBe(true);
  });
});

describe('RolesService.update', () => {
  const roleRepository = {
    findOne: jest.fn(),
    save: jest.fn((role) => Promise.resolve(role)),
  };
  const service = new RolesService(
    roleRepository as unknown as Repository<Role>,
    {} as PermissionsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('rechaza desactivar el rol admin por update', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      isActive: true,
    });

    await expect(service.update(1, { isActive: false })).rejects.toThrow(
      ConflictException,
    );
    expect(roleRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza renombrar el rol admin', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      isActive: true,
    });

    await expect(service.update(1, { name: 'superadmin' })).rejects.toThrow(
      ConflictException,
    );
    expect(roleRepository.save).not.toHaveBeenCalled();
  });

  it('permite editar la descripción del rol admin', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      isActive: true,
    });

    const role = await service.update(1, { description: 'Nuevo texto' });
    expect(role.description).toBe('Nuevo texto');
  });

  it('permite renombrar un rol que no es admin', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 2,
      name: 'docente',
      isActive: true,
    });

    const role = await service.update(2, { name: 'profesor' });
    expect(role.name).toBe('profesor');
  });
});

describe('RolesService.removePermission', () => {
  const roleRepository = {
    findOne: jest.fn(),
    save: jest.fn((role) => Promise.resolve(role)),
  };
  const service = new RolesService(
    roleRepository as unknown as Repository<Role>,
    {} as PermissionsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('rechaza quitar un permiso crítico del rol admin', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      permissions: [{ id: 5, code: 'users.read' }],
    });

    await expect(service.removePermission(1, 5)).rejects.toThrow(
      ConflictException,
    );
    expect(roleRepository.save).not.toHaveBeenCalled();
  });

  it('permite quitar un permiso no crítico del rol admin', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'admin',
      permissions: [
        { id: 5, code: 'users.read' },
        { id: 9, code: 'teachers.read' },
      ],
    });

    const role = await service.removePermission(1, 9);
    expect(role.permissions.map((p) => p.id)).toEqual([5]);
  });

  it('permite quitar un permiso crítico de un rol que no es admin', async () => {
    roleRepository.findOne.mockResolvedValue({
      id: 2,
      name: 'docente',
      permissions: [{ id: 5, code: 'users.read' }],
    });

    const role = await service.removePermission(2, 5);
    expect(role.permissions).toEqual([]);
  });
});
