import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { SemestersService } from './semesters.service';
import { Semester } from './entities/semester.entity';

const semester = {
  id: 1,
  name: '1er Cuatrimestre',
  number: 1,
  startDate: '2026-03-01',
  endDate: '2026-07-15',
};

describe('SemestersService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn((entity) => Promise.resolve(entity)),
  };
  const service = new SemestersService(
    repository as unknown as Repository<Semester>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea un cuatrimestre con el nombre recortado', async () => {
      await service.create({
        name: ' 1er Cuatrimestre ',
        number: 1,
        startDate: '2026-03-01',
        endDate: '2026-07-15',
      });

      expect(repository.create).toHaveBeenCalledWith({
        name: '1er Cuatrimestre',
        number: 1,
        startDate: '2026-03-01',
        endDate: '2026-07-15',
      });
    });

    it('rechaza fechas invertidas', () => {
      expect(() =>
        service.create({
          name: 'C1',
          number: 1,
          startDate: '2026-07-15',
          endDate: '2026-03-01',
        }),
      ).toThrow(BadRequestException);
    });

    it('rechaza number inválido o nombre vacío', () => {
      expect(() =>
        service.create({
          name: 'C1',
          number: 0,
          startDate: '2026-03-01',
          endDate: '2026-07-15',
        }),
      ).toThrow(BadRequestException);
      expect(() =>
        service.create({
          name: ' ',
          number: 1,
          startDate: '2026-03-01',
          endDate: '2026-07-15',
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devuelve los cuatrimestres ordenados por startDate descendente', async () => {
      repository.find.mockResolvedValue([semester]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { startDate: 'DESC' },
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
    it('actualiza campos y recorta el nombre', async () => {
      repository.findOneBy.mockResolvedValue({ ...semester });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, {
        name: ' 2do Cuatrimestre ',
        number: 2,
      });

      expect(result.name).toBe('2do Cuatrimestre');
      expect(result.number).toBe(2);
      expect(result.startDate).toBe('2026-03-01');
    });
  });

  describe('remove', () => {
    it('elimina el cuatrimestre si no está en uso', async () => {
      repository.findOneBy.mockResolvedValue({ ...semester });

      await expect(service.remove(1)).resolves.toEqual(semester);
      expect(repository.remove).toHaveBeenCalled();
    });

    it('traduce una violación de FK a ConflictException', async () => {
      repository.findOneBy.mockResolvedValue({ ...semester });
      repository.remove.mockRejectedValue(
        new QueryFailedError('DELETE', [], { code: '23503' } as never),
      );

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
