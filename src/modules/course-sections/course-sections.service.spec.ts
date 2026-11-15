import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CourseSectionsService } from './course-sections.service';
import { CourseSection } from './entities/course-section.entity';
import { StudyPlanAcademicCycle } from '../study-plan-academic-cycles/entities/study-plan-academic-cycle.entity';

const cycle = { id: 5, studyPlan: { id: 1 } };
const section = {
  id: 1,
  courseYear: 2,
  section: 'A',
  status: 'ACTIVO',
  studyPlanAcademicCycle: cycle,
};

describe('CourseSectionsService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve(entity)),
    find: jest.fn(),
    findOne: jest.fn(),
    manager: { findOneBy: jest.fn() },
  };
  const service = new CourseSectionsService(
    repository as unknown as Repository<CourseSection>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    repository.manager.findOneBy.mockImplementation((entity) =>
      Promise.resolve(entity === StudyPlanAcademicCycle ? cycle : null),
    );
  });

  describe('create', () => {
    it('crea una división ACTIVO asociada al plan/ciclo', async () => {
      await service.create({
        studyPlanAcademicCycleId: 5,
        courseYear: 2,
        section: ' A ',
      });

      expect(repository.create).toHaveBeenCalledWith({
        courseYear: 2,
        section: 'A',
        status: 'ACTIVO',
        studyPlanAcademicCycle: cycle,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza si el plan/ciclo no existe', async () => {
      repository.manager.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          studyPlanAcademicCycleId: 99,
          courseYear: 2,
          section: 'A',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rechaza courseYear inválido o sección vacía', async () => {
      await expect(
        service.create({
          studyPlanAcademicCycleId: 5,
          courseYear: 0,
          section: 'A',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create({
          studyPlanAcademicCycleId: 5,
          courseYear: 2,
          section: '  ',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devuelve las divisiones con relaciones', async () => {
      repository.find.mockResolvedValue([section]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { id: 'ASC' } }),
      );
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('cambia la división a otro plan/ciclo si se indica', async () => {
      const otherCycle = { id: 9 };
      repository.findOne.mockResolvedValue({ ...section });
      repository.manager.findOneBy.mockResolvedValue(otherCycle);
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, {
        studyPlanAcademicCycleId: 9,
        section: ' B ',
      });

      expect(result.studyPlanAcademicCycle).toBe(otherCycle);
      expect(result.section).toBe('B');
    });

    it('no toca el plan/ciclo si no se envía el id', async () => {
      repository.findOne.mockResolvedValue({ ...section });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.update(1, { courseYear: 3 });

      expect(repository.manager.findOneBy).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('cambia el estado de la división', async () => {
      repository.findOne.mockResolvedValue({ ...section });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.updateStatus(1, { status: 'INACTIVO' });

      expect(result.status).toBe('INACTIVO');
    });
  });

  describe('remove', () => {
    it('hace baja lógica de la división activa', async () => {
      repository.findOne.mockResolvedValue({ ...section });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(1);

      expect(result.status).toBe('INACTIVO');
    });

    it('lanza ConflictException si ya está inactiva', async () => {
      repository.findOne.mockResolvedValue({
        ...section,
        status: 'INACTIVO',
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });
});
