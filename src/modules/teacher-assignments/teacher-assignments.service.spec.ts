import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { ScheduleOverlapService } from '../schedules/schedule-overlap.service';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { PositionType } from '../position-types/entities/position-type.entity';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';

const titularPositionType = {
  id: 2,
  name: 'Titular',
  status: 'ACTIVO',
  allowsSubstitute: true,
};
const substitutePositionType = {
  id: 4,
  name: 'Suplente',
  status: 'ACTIVO',
  allowsSubstitute: true,
};
const activeTeacher = { id: 1, status: 'ACTIVO' };
const otherTeacher = { id: 3, status: 'ACTIVO' };

const courseSectionSubject = {
  id: 10,
  status: 'ACTIVO',
  subject: {
    weeklyHours: 4,
    allowsMultipleTeachers: false,
    maxTeachers: null,
    status: 'ACTIVO',
  },
  courseSection: { id: 5, status: 'ACTIVO' },
};

const validDto: CreateTeacherAssignmentDto = {
  teacherId: 1,
  positionTypeId: 2,
  courseSectionSubjectId: 10,
  weeklyHours: 4,
  startDate: '2026-03-01',
  endDate: '2026-12-01',
};

const titular = {
  id: 7,
  teacher: { id: 1 },
  positionType: { name: 'Titular', allowsSubstitute: true },
  courseSectionSubject,
  weeklyHours: 4,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

describe('TeacherAssignmentsService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ id: 99, ...entity })),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    exists: jest.fn(),
    manager: {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    },
  };
  const overlapService = { checkOverlap: jest.fn() };
  const service = new TeacherAssignmentsService(
    repository as unknown as Repository<TeacherAssignment>,
    overlapService as unknown as ScheduleOverlapService,
  );

  const mockRefs = (
    teacher = activeTeacher,
    positionType = titularPositionType,
  ) => {
    repository.manager.findOneBy.mockImplementation((entity) => {
      if (entity === Teacher) return Promise.resolve(teacher);
      if (entity === PositionType) return Promise.resolve(positionType);
      return Promise.resolve(null);
    });
    repository.manager.findOne.mockResolvedValue(courseSectionSubject);
    repository.manager.find.mockResolvedValue([]);
    repository.count.mockResolvedValue(0);
    // Los chequeos de duplicados usan where como array (overlapping());
    // findOne(id) usa where como objeto.
    repository.findOne.mockImplementation((options) => {
      if (Array.isArray(options?.where)) return Promise.resolve(null);
      return Promise.resolve(null);
    });
  };

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('crea una asignación titular válida', async () => {
      mockRefs();
      const saved = { id: 99 };
      repository.findOne.mockImplementation((options) => {
        const where = options?.where;
        if (Array.isArray(where)) return Promise.resolve(null);
        return Promise.resolve(where?.id === 99 ? saved : null);
      });

      const result = await service.create(validDto);

      expect(result).toEqual(saved);
      expect(repository.save).toHaveBeenCalled();
      expect(overlapService.checkOverlap).not.toHaveBeenCalled();
    });

    it('rechaza un docente inactivo', async () => {
      mockRefs({ ...activeTeacher, status: 'INACTIVO' });

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza un cargo a término sin fecha de fin', async () => {
      mockRefs(activeTeacher, {
        ...titularPositionType,
        name: 'A término',
      });

      await expect(
        service.create({ ...validDto, endDate: null }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza weeklyHours distinto al del plan de estudio', async () => {
      mockRefs();

      await expect(
        service.create({ ...validDto, weeklyHours: 5 }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza asignar sobre un ECCD, materia o división inactivos', async () => {
      mockRefs();
      repository.manager.findOne.mockResolvedValue({
        ...courseSectionSubject,
        status: 'INACTIVO',
      });

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();

      mockRefs();
      repository.manager.findOne.mockResolvedValue({
        ...courseSectionSubject,
        subject: { ...courseSectionSubject.subject, status: 'INACTIVO' },
      });

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );

      mockRefs();
      repository.manager.findOne.mockResolvedValue({
        ...courseSectionSubject,
        courseSection: { id: 5, status: 'INACTIVO' },
      });

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza una asignación duplicada en las mismas fechas', async () => {
      mockRefs();
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(Array.isArray(options?.where) ? { id: 50 } : null),
      );

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza un segundo titular si la materia no permite múltiples docentes', async () => {
      mockRefs();
      repository.count.mockResolvedValue(1);

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('crea una suplencia heredando división y horas del titular', async () => {
      mockRefs(otherTeacher, substitutePositionType);
      const saved = { id: 99 };
      repository.findOne.mockImplementation((options) => {
        const where = options?.where;
        if (Array.isArray(where)) return Promise.resolve(null);
        if (where?.id === 7) return Promise.resolve(titular);
        return Promise.resolve(saved);
      });

      const result = await service.create({
        teacherId: 3,
        positionTypeId: 4,
        replacedAssignmentId: 7,
        startDate: '2026-04-01',
        endDate: '2026-05-01',
      });

      expect(result).toEqual(saved);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          courseSectionSubject: titular.courseSectionSubject,
          weeklyHours: 4,
          replacedAssignment: titular,
        }),
      );
    });

    it('valida el solapamiento horario del docente también para suplencias', async () => {
      mockRefs(otherTeacher, substitutePositionType);
      repository.findOne.mockImplementation((options) => {
        const where = options?.where;
        if (Array.isArray(where)) return Promise.resolve(null);
        if (where?.id === 7) return Promise.resolve(titular);
        return Promise.resolve({ id: 99 });
      });
      repository.manager.find.mockResolvedValue([
        { day: { id: 1, name: 'Lunes' }, classHour: { id: 2 } },
      ]);
      overlapService.checkOverlap.mockResolvedValue([
        {
          nombreDocente: 'Ana',
          apellidoDocente: 'Gómez',
          idHorarioExistente: 9,
        },
      ]);

      await expect(
        service.create({
          teacherId: 3,
          positionTypeId: 4,
          replacedAssignmentId: 7,
          startDate: '2026-04-01',
          endDate: '2026-05-01',
        }),
      ).rejects.toThrow(ConflictException);

      expect(overlapService.checkOverlap).toHaveBeenCalledWith({
        idEccd: 10,
        idDia: 1,
        idHoraCatedra: 2,
        fechaDesde: '2026-04-01',
        fechaHasta: '2026-05-01',
        idDocente: 3,
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza una suplencia sin replacedAssignmentId', async () => {
      mockRefs(otherTeacher, substitutePositionType);

      await expect(
        service.create({
          teacherId: 3,
          positionTypeId: 4,
          startDate: '2026-04-01',
          endDate: '2026-05-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza una suplencia que se extiende más allá del titular', async () => {
      mockRefs(otherTeacher, substitutePositionType);
      repository.findOne.mockImplementation((options) => {
        const where = options?.where;
        if (Array.isArray(where)) return Promise.resolve(null);
        if (where?.id === 7) return Promise.resolve(titular);
        return Promise.resolve(null);
      });

      await expect(
        service.create({
          teacherId: 3,
          positionTypeId: 4,
          replacedAssignmentId: 7,
          startDate: '2026-04-01',
          endDate: '2027-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza una suplencia del mismo docente que el titular', async () => {
      mockRefs(activeTeacher, substitutePositionType);
      repository.findOne.mockImplementation((options) => {
        const where = options?.where;
        if (Array.isArray(where)) return Promise.resolve(null);
        if (where?.id === 7) return Promise.resolve(titular);
        return Promise.resolve(null);
      });

      await expect(
        service.create({
          teacherId: 1,
          positionTypeId: 4,
          replacedAssignmentId: 7,
          startDate: '2026-04-01',
          endDate: '2026-05-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('devuelve todas las asignaciones sin filtro', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('rechaza un teacherId que no es entero positivo', () => {
      expect(() => service.findAll('abc')).toThrow(BadRequestException);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('findExpiring', () => {
    it('rechaza days que no es entero positivo', () => {
      expect(() => service.findExpiring('x')).toThrow(BadRequestException);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const item = {
      id: 1,
      teacher: { id: 1 },
      positionType: titularPositionType,
      courseSectionSubject: { id: 10 },
      replacedAssignment: null,
      weeklyHours: 4,
      startDate: '2026-03-01',
      endDate: '2026-12-01',
    };

    it('no permite cambiar la división si tiene suplentes', async () => {
      mockRefs();
      repository.manager.findOne.mockResolvedValue({
        ...courseSectionSubject,
        id: 11,
      });
      repository.findOne.mockImplementation((options) =>
        Promise.resolve(Array.isArray(options?.where) ? null : item),
      );
      repository.exists.mockResolvedValue(true);

      await expect(
        service.update(1, { courseSectionSubjectId: 11 }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si la asignación no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('cierra la vigencia con la fecha de hoy si sigue activa', async () => {
      const item = {
        id: 1,
        startDate: '2020-01-01',
        endDate: null,
      };
      repository.findOne.mockResolvedValue(item);
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(1);

      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('lanza ConflictException si ya finalizó', async () => {
      repository.findOne.mockResolvedValue({
        id: 1,
        startDate: '2020-01-01',
        endDate: '2020-06-01',
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
