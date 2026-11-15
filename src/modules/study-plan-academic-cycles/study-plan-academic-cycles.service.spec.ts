import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { StudyPlanAcademicCyclesService } from './study-plan-academic-cycles.service';
import { StudyPlanAcademicCycle } from './entities/study-plan-academic-cycle.entity';
import { StudyPlan } from '../study-plans/entities/study-plans.entity';
import { AcademicCycle } from '../academic-cycles/entities/academic-cycle.entity';
import { Shift } from '../shifts/entities/shift.entity';

const refs = {
  [StudyPlan.name]: { id: 1 },
  [AcademicCycle.name]: { id: 2 },
  [Shift.name]: { id: 3 },
};

const dto = { studyPlanId: 1, academicCycleId: 2, shiftId: 3 };

describe('StudyPlanAcademicCyclesService', () => {
  const repository = {
    create: jest.fn(() => ({})),
    save: jest.fn((entity) => Promise.resolve({ id: 10, ...entity })),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn((entity) => Promise.resolve(entity)),
    manager: { findOneBy: jest.fn() },
  };
  const service = new StudyPlanAcademicCyclesService(
    repository as unknown as Repository<StudyPlanAcademicCycle>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    repository.create.mockReturnValue({});
    repository.manager.findOneBy.mockImplementation((entity) =>
      Promise.resolve(refs[(entity as { name: string }).name] ?? null),
    );
    // findOne(id) usa where:{id}; requireUniqueCombination usa where:{studyPlan...}
    repository.findOne.mockImplementation((options) =>
      Promise.resolve(options?.where?.id ? null : null),
    );
  });

  describe('create', () => {
    it('crea la combinación plan/ciclo/turno', async () => {
      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          studyPlan: refs[StudyPlan.name],
          academicCycle: refs[AcademicCycle.name],
          shift: refs[Shift.name],
        }),
      );
      expect(result.id).toBe(10);
    });

    it('rechaza si alguna referencia no existe', async () => {
      repository.manager.findOneBy.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza ids que no son enteros positivos', async () => {
      await expect(
        service.create({ ...dto, studyPlanId: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza la combinación duplicada plan+ciclo+turno', async () => {
      repository.findOne.mockResolvedValue({ id: 50 });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devuelve las combinaciones con relaciones', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { id: 'ASC' } }),
      );
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(options?.where?.id ? null : { id: 1 }),
      );

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const item = {
      id: 10,
      studyPlan: refs[StudyPlan.name],
      academicCycle: refs[AcademicCycle.name],
      shift: refs[Shift.name],
    };

    it('actualiza sin conflicto cuando la combinación es la misma', async () => {
      // findOne(id) devuelve el item; requireUniqueCombination lo encuentra a sí mismo.
      repository.findOne.mockResolvedValue(item);
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(10, {});

      expect(result).toMatchObject({ id: 10 });
      expect(repository.save).toHaveBeenCalledWith(item);
    });

    it('rechaza si la nueva combinación ya existe con otro id', async () => {
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(
          options?.where?.id ? item : { id: 50, ...item, id: 50 },
        ),
      );

      await expect(service.update(10, {})).rejects.toThrow(ConflictException);
    });

    it('permite cambiar el turno resolviendo la nueva referencia', async () => {
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(options?.where?.id ? item : item),
      );
      repository.manager.findOneBy.mockImplementation((entity) =>
        Promise.resolve(
          entity === Shift ? { id: 7 } : refs[(entity as { name: string }).name],
        ),
      );
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.update(10, { shiftId: 7 });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ shift: { id: 7 } }),
      );
    });
  });

  describe('remove', () => {
    it('elimina la combinación si no tiene divisiones', async () => {
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(options?.where?.id ? { id: 10 } : null),
      );

      await expect(service.remove(10)).resolves.toBeDefined();
      expect(repository.remove).toHaveBeenCalled();
    });

    it('traduce una violación de FK a ConflictException', async () => {
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(options?.where?.id ? { id: 10 } : null),
      );
      repository.remove.mockRejectedValue(
        new QueryFailedError('DELETE', [], { code: '23503' } as never),
      );

      await expect(service.remove(10)).rejects.toThrow(ConflictException);
    });
  });
});
