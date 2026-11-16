import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { StudyPlanService } from './study-plans.service';
import { StudyPlan } from './entities/study-plans.entity';
import { STUDY_PLAN_STATUS } from './study-plan-status';
import { CreateStudyPlanDto } from './dto/create-study-plans.dto';

const degree = { id: 1, name: 'Ingeniería' };

const validDto: CreateStudyPlanDto = {
  name: 'Plan 2026',
  degreeId: 1,
  durationYears: 5,
  validityYear: 2026,
  startDate: '2026-01-01',
};

const plan = {
  id: 10,
  name: 'Plan 2026',
  degree,
  durationYears: 5,
  validityYear: 2026,
  startDate: '2026-01-01',
  endDate: null,
  status: STUDY_PLAN_STATUS.NO_VIGENTE,
};

describe('StudyPlanService', () => {
  const txRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
    create: jest.fn((entity) => entity),
  };
  const txManager = {
    getRepository: jest.fn(() => txRepository),
  } as unknown as EntityManager;
  const repository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
    manager: {
      findOneBy: jest.fn(),
      transaction: jest.fn((cb) => cb(txManager)),
      count: jest.fn(),
    },
  };
  const service = new StudyPlanService(
    repository as unknown as Repository<StudyPlan>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea un plan vigente cuando la carrera no tiene otro', async () => {
      repository.manager.findOneBy.mockResolvedValue(degree);
      txRepository.findOne.mockResolvedValue(null);

      await service.create({ ...validDto, status: 'VIGENTE' });

      expect(txRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Plan 2026',
          status: 'VIGENTE',
          degree,
          endDate: null,
        }),
      );
      expect(txRepository.save).toHaveBeenCalled();
    });

    it('usa VIGENTE como estado por defecto', async () => {
      repository.manager.findOneBy.mockResolvedValue(degree);
      txRepository.findOne.mockResolvedValue(null);

      await service.create(validDto);

      expect(txRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'VIGENTE' }),
      );
    });

    it('no chequea conflicto de vigente si el plan nace NO_VIGENTE', async () => {
      repository.manager.findOneBy.mockResolvedValue(degree);

      await service.create({ ...validDto, status: 'NO_VIGENTE' });

      expect(txRepository.findOne).not.toHaveBeenCalled();
    });

    it('rechaza crear un plan directamente archivado', async () => {
      await expect(
        service.create({ ...validDto, status: 'ARCHIVADO' }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.manager.findOneBy).not.toHaveBeenCalled();
    });

    it('responde 409 VIGENTE_EXISTENTE si la carrera ya tiene un plan vigente', async () => {
      repository.manager.findOneBy.mockResolvedValue(degree);
      txRepository.findOne.mockResolvedValue({
        id: 5,
        name: 'Plan viejo',
      });

      const error = await service
        .create({ ...validDto, status: 'VIGENTE' })
        .catch((e) => e);

      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toMatchObject({ code: 'VIGENTE_EXISTENTE' });
      expect(txRepository.save).not.toHaveBeenCalled();
    });

    it('con replaceCurrentVigente archiva el vigente anterior y crea el nuevo', async () => {
      const current = { id: 5, name: 'Plan viejo', status: 'VIGENTE' };
      repository.manager.findOneBy.mockResolvedValue(degree);
      txRepository.findOne.mockResolvedValue(current);

      await service.create({
        ...validDto,
        status: 'VIGENTE',
        replaceCurrentVigente: true,
      });

      expect(current.status).toBe(STUDY_PLAN_STATUS.NO_VIGENTE);
      expect(txRepository.save).toHaveBeenCalledWith(current);
    });

    it('rechaza un endDate anterior al startDate', async () => {
      await expect(
        service.create({ ...validDto, endDate: '2025-01-01' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un status inválido', async () => {
      await expect(
        service.create({ ...validDto, status: 'BORRADO' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el plan no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza campos de un plan NO_VIGENTE', async () => {
      repository.findOne.mockResolvedValue({ ...plan });

      await service.update(10, { name: 'Plan nuevo' });

      expect(txRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Plan nuevo' }),
      );
    });

    it('permite pasar a VIGENTE si la carrera no tiene otro vigente', async () => {
      const vigente = { ...plan, status: STUDY_PLAN_STATUS.NO_VIGENTE };
      repository.findOne.mockResolvedValue(vigente);
      // El único vigente que encuentra es el mismo plan que se edita.
      txRepository.findOne.mockResolvedValue({ ...vigente, id: 10 });

      await service.update(10, { status: 'VIGENTE' });

      expect(txRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'VIGENTE' }),
      );
    });

    it('rechaza el cambio de estado de un plan archivado', async () => {
      repository.findOne.mockResolvedValue({
        ...plan,
        status: STUDY_PLAN_STATUS.ARCHIVADO,
      });

      await expect(service.update(10, { status: 'VIGENTE' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('rechaza archivar un plan por update (solo vía remove)', async () => {
      repository.findOne.mockResolvedValue({ ...plan });

      await expect(service.update(10, { status: 'ARCHIVADO' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('lanza NotFoundException si el plan no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('archiva un plan sin materias asociadas', async () => {
      const vigente = { ...plan, status: STUDY_PLAN_STATUS.VIGENTE };
      repository.findOne.mockResolvedValue(vigente);
      repository.manager.count.mockResolvedValue(0);

      const result = await service.remove(10);

      expect(result.status).toBe(STUDY_PLAN_STATUS.ARCHIVADO);
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza archivar un plan con espacios curriculares', async () => {
      repository.findOne.mockResolvedValue({ ...plan });
      repository.manager.count.mockResolvedValue(3);

      await expect(service.remove(10)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza archivar un plan ya archivado', async () => {
      repository.findOne.mockResolvedValue({
        ...plan,
        status: STUDY_PLAN_STATUS.ARCHIVADO,
      });

      await expect(service.remove(10)).rejects.toThrow(ConflictException);
    });
  });
});
