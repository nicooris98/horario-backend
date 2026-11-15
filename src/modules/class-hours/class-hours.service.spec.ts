import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { ClassHoursService } from './class-hours.service';
import { ClassHour } from './entities/class-hour.entity';

const classHour = {
  id: 1,
  slotNumber: 1,
  startTime: '08:00',
  endTime: '09:30',
};

describe('ClassHoursService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn((entity) => Promise.resolve(entity)),
  };
  const service = new ClassHoursService(
    repository as unknown as Repository<ClassHour>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea una hora cátedra válida', async () => {
      await service.create({
        slotNumber: 1,
        startTime: '08:00',
        endTime: '09:30',
      });

      expect(repository.create).toHaveBeenCalledWith({
        slotNumber: 1,
        startTime: '08:00',
        endTime: '09:30',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza endTime anterior o igual a startTime', () => {
      expect(() =>
        service.create({ slotNumber: 1, startTime: '09:30', endTime: '08:00' }),
      ).toThrow(BadRequestException);
      expect(() =>
        service.create({ slotNumber: 1, startTime: '08:00', endTime: '08:00' }),
      ).toThrow(BadRequestException);
    });

    it('rechaza un slotNumber que no es entero positivo', () => {
      expect(() =>
        service.create({ slotNumber: 0, startTime: '08:00', endTime: '09:30' }),
      ).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devuelve las horas ordenadas por slotNumber', async () => {
      repository.find.mockResolvedValue([classHour]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { slotNumber: 'ASC' },
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
    it('actualiza campos y revalida el orden de horas', async () => {
      repository.findOneBy.mockResolvedValue({ ...classHour });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { endTime: '10:00' });

      expect(result.endTime).toBe('10:00');
      expect(result.slotNumber).toBe(1);
    });

    it('rechaza una actualización con horas invertidas', async () => {
      repository.findOneBy.mockResolvedValue({ ...classHour });

      await expect(service.update(1, { startTime: '10:00' })).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('elimina la hora cátedra si no está en uso', async () => {
      repository.findOneBy.mockResolvedValue({ ...classHour });

      await expect(service.remove(1)).resolves.toEqual(classHour);
      expect(repository.remove).toHaveBeenCalled();
    });

    it('traduce una violación de FK a ConflictException', async () => {
      repository.findOneBy.mockResolvedValue({ ...classHour });
      repository.remove.mockRejectedValue(
        new QueryFailedError('DELETE', [], { code: '23503' } as never),
      );

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });

    it('propaga errores que no son violación de FK', async () => {
      repository.findOneBy.mockResolvedValue({ ...classHour });
      repository.remove.mockRejectedValue(new Error('connection lost'));

      await expect(service.remove(1)).rejects.toThrow('connection lost');
    });
  });
});
