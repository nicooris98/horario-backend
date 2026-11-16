import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AcademicCyclesService } from './academic-cycles.service';
import { AcademicCycle } from './entities/academic-cycle.entity';

const cycle = {
  id: 1,
  year: 2026,
  startDate: '2026-03-01',
  endDate: '2026-12-15',
  status: 'ACTIVO',
};

describe('AcademicCyclesService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
  const service = new AcademicCyclesService(
    repository as unknown as Repository<AcademicCycle>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea un ciclo ACTIVO', async () => {
      await service.create({
        year: 2026,
        startDate: '2026-03-01',
        endDate: '2026-12-15',
      });

      expect(repository.create).toHaveBeenCalledWith({
        year: 2026,
        startDate: '2026-03-01',
        endDate: '2026-12-15',
        status: 'ACTIVO',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza endDate anterior a startDate', () => {
      expect(() =>
        service.create({
          year: 2026,
          startDate: '2026-12-15',
          endDate: '2026-03-01',
        }),
      ).toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza un año que no es entero positivo', () => {
      expect(() =>
        service.create({
          year: 0,
          startDate: '2026-03-01',
          endDate: '2026-12-15',
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devuelve los ciclos ordenados por año descendente', async () => {
      repository.find.mockResolvedValue([cycle]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { year: 'DESC' },
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
    it('actualiza campos y revalida las fechas', async () => {
      repository.findOneBy.mockResolvedValue({ ...cycle });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { endDate: '2027-01-31' });

      expect(result.endDate).toBe('2027-01-31');
      expect(result.year).toBe(2026);
    });

    it('rechaza una actualización con fechas invertidas', async () => {
      repository.findOneBy.mockResolvedValue({ ...cycle });

      await expect(
        service.update(1, { startDate: '2027-01-01' }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('cambia el estado del ciclo', async () => {
      repository.findOneBy.mockResolvedValue({ ...cycle });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.updateStatus(1, { status: 'INACTIVO' });

      expect(result.status).toBe('INACTIVO');
    });
  });

  describe('remove', () => {
    it('hace baja lógica del ciclo activo', async () => {
      repository.findOneBy.mockResolvedValue({ ...cycle });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(1);

      expect(result.status).toBe('INACTIVO');
    });

    it('lanza ConflictException si ya está inactivo', async () => {
      repository.findOneBy.mockResolvedValue({
        ...cycle,
        status: 'INACTIVO',
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
