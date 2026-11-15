import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PositionTypesService } from './position-types.service';
import { PositionType } from './entities/position-type.entity';

const positionType = {
  id: 1,
  name: 'Interino',
  description: 'Cargo interino',
  allowsSubstitute: true,
  status: 'ACTIVO',
};

describe('PositionTypesService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
  const service = new PositionTypesService(
    repository as unknown as Repository<PositionType>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('normaliza nombre, descripción, defaults y status', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await service.create({
        name: ' Interino ',
        description: ' Cargo ',
        allowsSubstitute: true,
        status: 'activo',
      });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Interino',
        description: 'Cargo',
        allowsSubstitute: true,
        status: 'ACTIVO',
      });
    });

    it('aplica defaults: allowsSubstitute false y status ACTIVO', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await service.create({ name: 'Titular' });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          allowsSubstitute: false,
          status: 'ACTIVO',
          description: null,
        }),
      );
    });

    it('rechaza un status inválido', async () => {
      await expect(
        service.create({ name: 'X', status: 'BORRADO' }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.findOneBy).not.toHaveBeenCalled();
    });

    it('rechaza allowsSubstitute que no es booleano', async () => {
      await expect(
        service.create({ name: 'X', allowsSubstitute: 'si' as never }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un nombre duplicado sin distinguir mayúsculas', async () => {
      repository.findOneBy.mockResolvedValue({
        id: 5,
        name: 'interino',
      });

      await expect(service.create({ name: 'Interino' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devuelve los tipos de cargo ordenados por id', async () => {
      repository.find.mockResolvedValue([positionType]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza sin chequear unicidad si el nombre no cambió (ni en case)', async () => {
      repository.findOneBy.mockResolvedValue({ ...positionType });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, {
        name: 'interino',
        description: 'Nueva desc',
      });

      // Solo se llamó findOneBy para findOne({id}), no para la unicidad.
      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('interino');
      expect(result.description).toBe('Nueva desc');
    });

    it('verifica unicidad si el nombre cambia', async () => {
      repository.findOneBy.mockImplementation((where) =>
        Promise.resolve(where?.id ? { ...positionType } : null),
      );
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.update(1, { name: 'Suplente' });

      expect(repository.findOneBy).toHaveBeenCalledTimes(2);
    });

    it('permite conservar el nombre aunque exista el mismo id', async () => {
      repository.findOneBy.mockImplementation((where) =>
        Promise.resolve(
          where?.id === 1 ? { ...positionType } : { id: 1, name: 'Otro' },
        ),
      );
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      await expect(
        service.update(1, { name: 'Diferente' }),
      ).resolves.toBeDefined();
    });
  });

  describe('deactivate', () => {
    it('marca el tipo de cargo como INACTIVO', async () => {
      repository.findOneBy.mockResolvedValue({ ...positionType });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.deactivate(1);

      expect(result.status).toBe('INACTIVO');
    });
  });

  describe('remove', () => {
    it('hace baja lógica del tipo de cargo activo', async () => {
      repository.findOneBy.mockResolvedValue({ ...positionType });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(1);

      expect(result.status).toBe('INACTIVO');
    });

    it('lanza ConflictException si ya está inactivo', async () => {
      repository.findOneBy.mockResolvedValue({
        ...positionType,
        status: 'INACTIVO',
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
