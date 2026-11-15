import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { StudyPlan } from '../study-plans/entities/study-plans.entity';
import { Regime } from '../regimes/entities/regime.entity';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';

const studyPlan = { id: 1, name: 'Plan 2026', durationYears: 5 };
const regime = { id: 1, name: 'Cuatrimestral' };

const validDto: CreateAsignaturaDto = {
  name: 'Programación Web',
  year: 2,
  regimeId: 1,
  weeklyHours: 4,
  allowsMultipleTeachers: false,
  studyPlanId: 1,
};

const subject = {
  id: 7,
  name: 'Programación Web',
  year: 2,
  weeklyHours: 4,
  allowsMultipleTeachers: false,
  maxTeachers: null,
  status: 'ACTIVO',
  studyPlan,
  regime,
};

describe('SubjectsService', () => {
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
  };
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ id: 7, ...entity })),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
    manager: { findOneBy: jest.fn() },
  };
  const service = new SubjectsService(
    repository as unknown as Repository<Subject>,
  );

  const mockRefs = () => {
    repository.manager.findOneBy.mockImplementation((entity) => {
      if (entity === StudyPlan) return Promise.resolve(studyPlan);
      if (entity === Regime) return Promise.resolve(regime);
      return Promise.resolve(null);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.where.mockReturnThis();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.getCount.mockResolvedValue(0);
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
  });

  describe('create', () => {
    it('crea una materia ACTIVO con maxTeachers null si no permite múltiples', async () => {
      mockRefs();

      await service.create(validDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Programación Web',
          maxTeachers: null,
          status: 'ACTIVO',
          studyPlan,
          regime,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('normaliza maxTeachers a 2 cuando permite múltiples sin máximo', async () => {
      mockRefs();

      await service.create({
        ...validDto,
        allowsMultipleTeachers: true,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ maxTeachers: 2 }),
      );
    });

    it('rechaza un año de cursado mayor a la duración del plan', async () => {
      mockRefs();

      await expect(
        service.create({ ...validDto, year: 6 }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza un nombre duplicado en el mismo plan', async () => {
      mockRefs();
      queryBuilder.getCount.mockResolvedValue(1);

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza plan de estudio inexistente', async () => {
      repository.manager.findOneBy.mockImplementation((entity) => {
        if (entity === Regime) return Promise.resolve(regime);
        return Promise.resolve(null);
      });

      await expect(service.create(validDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('sin filtros devuelve todas las materias', async () => {
      repository.find.mockResolvedValue([subject]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filtra por plan de estudio', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll({ studyPlanId: 3 });

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studyPlan: { id: 3 } } }),
      );
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si la materia no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza campos y vuelve a validar contra el plan', async () => {
      repository.findOne.mockResolvedValue({ ...subject });

      const result = await service.update(7, { weeklyHours: 6 });

      expect(result.weeklyHours).toBe(6);
      expect(repository.save).toHaveBeenCalled();
    });

    it('excluye la propia materia del chequeo de nombre duplicado', async () => {
      repository.findOne.mockResolvedValue({ ...subject });

      await service.update(7, { name: 'Nuevo nombre' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'subject.id_espacio_curricular != :excludeSubjectId',
        { excludeSubjectId: 7 },
      );
    });

    it('rechaza un año de cursado inválido para el plan', async () => {
      repository.findOne.mockResolvedValue({ ...subject });

      await expect(service.update(7, { year: 9 })).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('no guarda si el estado no cambia', async () => {
      repository.findOne.mockResolvedValue({ ...subject });

      const result = await service.updateStatus(7, { status: 'ACTIVO' });

      expect(result.status).toBe('ACTIVO');
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('guarda el nuevo estado', async () => {
      repository.findOne.mockResolvedValue({ ...subject });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.updateStatus(7, { status: 'INACTIVO' });

      expect(result.status).toBe('INACTIVO');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('hace baja lógica de una materia activa', async () => {
      repository.findOne.mockResolvedValue({ ...subject });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(7);

      expect(result.status).toBe('INACTIVO');
    });

    it('lanza ConflictException si ya está inactiva', async () => {
      repository.findOne.mockResolvedValue({
        ...subject,
        status: 'INACTIVO',
      });

      await expect(service.remove(7)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
