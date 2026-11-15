import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';

const shift = {
  id: 1,
  name: 'Mañana',
  startTime: '08:00',
  endTime: '13:00',
  status: 'ACTIVO',
};

describe('ShiftsService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
  const service = new ShiftsService(
    repository as unknown as Repository<Shift>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea un turno ACTIVO con el nombre recortado', async () => {
      await service.create({
        name: ' Mañana ',
        startTime: '08:00',
        endTime: '13:00',
      });

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Mañana',
        startTime: '08:00',
        endTime: '13:00',
        status: 'ACTIVO',
      });
    });

    it('rechaza endTime anterior o igual a startTime', () => {
      expect(() =>
        service.create({ name: 'T', startTime: '13:00', endTime: '08:00' }),
      ).toThrow(BadRequestException);
    });

    it('rechaza un nombre vacío', () => {
      expect(() =>
        service.create({ name: ' ', startTime: '08:00', endTime: '13:00' }),
      ).toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devuelve los turnos ordenados por hora de inicio', async () => {
      repository.find.mockResolvedValue([shift]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { startTime: 'ASC' },
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
    it('actualiza campos y revalida las horas', async () => {
      repository.findOneBy.mockResolvedValue({ ...shift });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { endTime: '14:00' });

      expect(result.endTime).toBe('14:00');
      expect(result.name).toBe('Mañana');
    });
  });

  describe('updateStatus', () => {
    it('cambia el estado del turno', async () => {
      repository.findOneBy.mockResolvedValue({ ...shift });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.updateStatus(1, { status: 'INACTIVO' });

      expect(result.status).toBe('INACTIVO');
    });
  });

  describe('remove', () => {
    it('hace baja lógica del turno activo', async () => {
      repository.findOneBy.mockResolvedValue({ ...shift });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(1);

      expect(result.status).toBe('INACTIVO');
    });

    it('lanza ConflictException si ya está inactivo', async () => {
      repository.findOneBy.mockResolvedValue({
        ...shift,
        status: 'INACTIVO',
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
