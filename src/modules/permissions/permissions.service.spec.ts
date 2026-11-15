import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';

const permission = {
  id: 1,
  name: 'Ver docentes',
  code: 'teachers.read',
  isActive: true,
};

describe('PermissionsService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const service = new PermissionsService(
    repository as unknown as Repository<Permission>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea y guarda un permiso', async () => {
      await service.create({ name: 'Ver docentes', code: 'teachers.read' });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Ver docentes',
        code: 'teachers.read',
      });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devuelve todos los permisos', async () => {
      repository.find.mockResolvedValue([permission]);

      await expect(service.findAll()).resolves.toEqual([permission]);
      expect(repository.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('devuelve el permiso si existe', async () => {
      repository.findOne.mockResolvedValue(permission);

      await expect(service.findOne(1)).resolves.toBe(permission);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lanza NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza los campos del permiso', async () => {
      repository.findOne.mockResolvedValue({ ...permission });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { name: 'Editar docentes' });

      expect(result.name).toBe('Editar docentes');
      expect(result.code).toBe('teachers.read');
    });

    it('lanza NotFoundException si el permiso no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('setActive', () => {
    it('desactiva un permiso', async () => {
      repository.findOne.mockResolvedValue({ ...permission });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.setActive(1, false);

      expect(result.isActive).toBe(false);
      expect(repository.save).toHaveBeenCalled();
    });

    it('activa un permiso', async () => {
      repository.findOne.mockResolvedValue({
        ...permission,
        isActive: false,
      });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.setActive(1, true);

      expect(result.isActive).toBe(true);
    });

    it('rechaza desactivar un permiso crítico de administración', async () => {
      repository.findOne.mockResolvedValue({
        ...permission,
        code: 'users.read',
      });

      await expect(service.setActive(1, false)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('permisos críticos', () => {
    it('rechaza cambiar el code de un permiso crítico', async () => {
      repository.findOne.mockResolvedValue({
        ...permission,
        code: 'roles.read',
      });

      await expect(service.update(1, { code: 'roles.custom' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('permite cambiar el nombre de un permiso crítico', async () => {
      repository.findOne.mockResolvedValue({
        ...permission,
        code: 'roles.read',
      });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { name: 'Ver roles admin' });

      expect(result.name).toBe('Ver roles admin');
      expect(result.code).toBe('roles.read');
    });

    it('permite desactivar un permiso no crítico', async () => {
      repository.findOne.mockResolvedValue({ ...permission });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.setActive(1, false);

      expect(result.isActive).toBe(false);
    });
  });
});
