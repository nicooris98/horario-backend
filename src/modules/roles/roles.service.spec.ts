import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';

describe('RolesService.setActive', () => {
  const roleRepository = {
    findOne: jest.fn(),
    save: jest.fn((role) => Promise.resolve(role)),
  };
  const service = new RolesService(
    roleRepository as unknown as Repository<Role>,
    {} as PermissionsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('desactiva un rol', async () => {
    roleRepository.findOne.mockResolvedValue({ id: 1, name: 'ADMIN', isActive: true });
    const role = await service.setActive(1, false);
    expect(role.isActive).toBe(false);
    expect(roleRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  });

  it('activa un rol', async () => {
    roleRepository.findOne.mockResolvedValue({ id: 1, name: 'ADMIN', isActive: false });
    const role = await service.setActive(1, true);
    expect(role.isActive).toBe(true);
  });

  it('tira 404 si el rol no existe', async () => {
    roleRepository.findOne.mockResolvedValue(null);
    await expect(service.setActive(99, true)).rejects.toThrow(NotFoundException);
  });
});
