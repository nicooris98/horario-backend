import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { RegimesService } from './regimes.service';
import { Regime } from './entities/regime.entity';

const regime = { id: 1, name: 'Cuatrimestral' };

describe('RegimesService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn((entity) => Promise.resolve(entity)),
  };
  const service = new RegimesService(
    repository as unknown as Repository<Regime>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea un régimen con el nombre recortado', async () => {
      await service.create({ name: ' Cuatrimestral ' });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Cuatrimestral',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza un nombre vacío', () => {
      expect(() => service.create({ name: '   ' })).toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devuelve los regímenes ordenados por id', async () => {
      repository.find.mockResolvedValue([regime]);

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
    it('actualiza el nombre si viene en el dto', async () => {
      repository.findOneBy.mockResolvedValue({ ...regime });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { name: 'Anual' });

      expect(result.name).toBe('Anual');
    });

    it('no modifica el nombre si no viene en el dto', async () => {
      repository.findOneBy.mockResolvedValue({ ...regime });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, {});

      expect(result.name).toBe('Cuatrimestral');
    });

    it('rechaza un nombre vacío', async () => {
      repository.findOneBy.mockResolvedValue({ ...regime });

      await expect(service.update(1, { name: ' ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('elimina el régimen si no está en uso', async () => {
      repository.findOneBy.mockResolvedValue({ ...regime });

      await expect(service.remove(1)).resolves.toEqual(regime);
      expect(repository.remove).toHaveBeenCalled();
    });

    it('traduce una violación de FK a ConflictException', async () => {
      repository.findOneBy.mockResolvedValue({ ...regime });
      repository.remove.mockRejectedValue(
        new QueryFailedError('DELETE', [], { code: '23503' } as never),
      );

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
