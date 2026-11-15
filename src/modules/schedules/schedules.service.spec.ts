import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SchedulesService } from './schedules.service';
import { ScheduleOverlapService } from './schedule-overlap.service';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';

const validDto: CreateScheduleDto = {
  idCursado: 10,
  idCuatrimestre: 1,
  idHoraCatedra: 2,
  idDia: 3,
  fechaDesde: '2026-03-01',
  fechaHasta: '2026-06-30',
};

const schedule = {
  id: 5,
  courseSectionSubject: { id: 10 },
  semester: { id: 1 },
  classHour: { id: 2 },
  day: { id: 3 },
  startDate: '2026-03-01',
  endDate: null,
};

describe('SchedulesService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ id: 5, ...entity })),
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const overlapService = { checkOverlap: jest.fn() };
  const service = new SchedulesService(
    repository as unknown as Repository<Schedule>,
    overlapService as unknown as ScheduleOverlapService,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea un horario cuando no hay solapamientos', async () => {
      overlapService.checkOverlap.mockResolvedValue([]);

      await service.create(validDto);

      expect(overlapService.checkOverlap).toHaveBeenCalledWith({
        idEccd: 10,
        idDia: 3,
        idHoraCatedra: 2,
        fechaDesde: '2026-03-01',
        fechaHasta: '2026-06-30',
      });
      expect(repository.create).toHaveBeenCalledWith({
        courseSectionSubject: { id: 10 },
        semester: { id: 1 },
        classHour: { id: 2 },
        day: { id: 3 },
        startDate: '2026-03-01',
        endDate: '2026-06-30',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('lanza ConflictException si el docente ya tiene clase en ese franja', async () => {
      overlapService.checkOverlap.mockResolvedValue([
        {
          nombreDocente: 'Ana',
          apellidoDocente: 'Gómez',
          conflictoDesde: '2026-04-01',
          conflictoHasta: null,
          idHorarioExistente: 9,
        },
      ]);

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza una fechaHasta anterior a fechaDesde', async () => {
      await expect(
        service.create({ ...validDto, fechaHasta: '2026-01-01' }),
      ).rejects.toThrow(BadRequestException);
      expect(overlapService.checkOverlap).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devuelve los horarios con sus relaciones', async () => {
      repository.find.mockResolvedValue([schedule]);

      await expect(service.findAll()).resolves.toEqual([schedule]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: {
          courseSectionSubject: true,
          semester: true,
          classHour: true,
          day: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('devuelve el horario si existe', async () => {
      repository.findOne.mockResolvedValue(schedule);

      await expect(service.findOne(5)).resolves.toBe(schedule);
    });

    it('lanza NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('fusiona los datos y excluye el propio horario del chequeo de solapamiento', async () => {
      repository.findOne.mockResolvedValue(schedule);
      overlapService.checkOverlap.mockResolvedValue([]);

      await service.update(5, { fechaHasta: '2026-12-01' });

      expect(overlapService.checkOverlap).toHaveBeenCalledWith({
        idEccd: 10,
        idDia: 3,
        idHoraCatedra: 2,
        fechaDesde: '2026-03-01',
        fechaHasta: '2026-12-01',
        excludeIdHorario: 5,
      });
      expect(repository.save).toHaveBeenCalledWith({
        id: 5,
        courseSectionSubject: { id: 10 },
        semester: { id: 1 },
        classHour: { id: 2 },
        day: { id: 3 },
        startDate: '2026-03-01',
        endDate: '2026-12-01',
      });
    });

    it('lanza ConflictException si la actualización genera solapamiento', async () => {
      repository.findOne.mockResolvedValue(schedule);
      overlapService.checkOverlap.mockResolvedValue([
        {
          nombreDocente: 'Ana',
          apellidoDocente: 'Gómez',
          conflictoDesde: '2026-03-01',
          conflictoHasta: null,
          idHorarioExistente: 9,
        },
      ]);

      await expect(service.update(5, {})).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el horario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('cierra la vigencia del horario con la fecha de hoy si sigue activo', async () => {
      repository.findOne.mockResolvedValue({ ...schedule, endDate: null });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(5);

      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(repository.save).toHaveBeenCalled();
    });

    it('usa la fecha de inicio si el horario todavía no comenzó', async () => {
      const future = {
        ...schedule,
        startDate: '2999-01-01',
        endDate: null,
      };
      repository.findOne.mockResolvedValue(future);
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(5);

      expect(result.endDate).toBe('2999-01-01');
    });

    it('lanza ConflictException si el horario ya está finalizado', async () => {
      repository.findOne.mockResolvedValue({
        ...schedule,
        endDate: '2000-01-01',
      });

      await expect(service.remove(5)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
