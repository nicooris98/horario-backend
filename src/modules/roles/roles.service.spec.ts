import { NotFoundException } from '@nestjs/common';
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
    txManager.findOne.mockResolvedValue({ id: 1, name: 'ADMIN', isActive: true });
    const role = await service.setActive(1, false);
    expect(role.isActive).toBe(false);
    expect(txManager.save).toHaveBeenCalledWith(Role, expect.objectContaining({ isActive: false }));
    expect(roleRepository.save).not.toHaveBeenCalled();
  });

  it('activa un rol', async () => {
    txManager.findOne.mockResolvedValue({ id: 1, name: 'ADMIN', isActive: false });
    const role = await service.setActive(1, true);
    expect(role.isActive).toBe(true);
  });

  it('tira 404 si el rol no existe', async () => {
    txManager.findOne.mockResolvedValue(null);
    await expect(service.setActive(99, true)).rejects.toThrow(NotFoundException);
    expect(txManager.save).not.toHaveBeenCalled();
  });

  it('bloquea la fila del rol con FOR UPDATE dentro de una transaccion', async () => {
    txManager.findOne.mockResolvedValue({ id: 1, name: 'ADMIN', isActive: true });
    await service.setActive(1, false);
    expect(roleRepository.manager.transaction).toHaveBeenCalledTimes(1);
    expect(txManager.findOne).toHaveBeenCalledWith(Role, {
      where: { id: 1 },
      lock: { mode: 'pessimistic_write' },
    });
    expect(roleRepository.findOne).not.toHaveBeenCalled();
  });

  it('propaga el error de escritura para que la transaccion se revierta', async () => {
    txManager.findOne.mockResolvedValue({ id: 1, name: 'ADMIN', isActive: true });
    txManager.save.mockRejectedValueOnce(new Error('db error'));
    await expect(service.setActive(1, false)).rejects.toThrow('db error');
  });
});
