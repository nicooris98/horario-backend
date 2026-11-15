import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { TeacherAssignment } from '../teacher-assignments/entities/teacher-assignment.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';

const validDto: CreateTeacherDto = {
  dni: '39.040.338',
  firstName: 'Ana',
  lastName: 'Gómez',
  email: 'ANA@Example.com',
};

const teacher = {
  id: 1,
  dni: '39040338',
  firstName: 'Ana',
  lastName: 'Gómez',
  phone: null,
  email: 'ana@example.com',
  fileNumber: null,
  status: 'ACTIVO',
};

describe('TeachersService', () => {
  const repository = {
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
  const assignments = { find: jest.fn() };
  const service = new TeachersService(
    repository as unknown as Repository<Teacher>,
    assignments as unknown as Repository<TeacherAssignment>,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('normaliza DNI, email y status por defecto ACTIVO', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await service.create(validDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dni: '39040338',
          email: 'ana@example.com',
          status: 'ACTIVO',
          fileNumber: null,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza un DNI sin 7 u 8 dígitos', async () => {
      await expect(
        service.create({ ...validDto, dni: '123' }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rechaza un docente sin teléfono ni email', async () => {
      await expect(
        service.create({
          dni: '39.040.338',
          firstName: 'Ana',
          lastName: 'Gómez',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un email inválido', async () => {
      await expect(
        service.create({ ...validDto, email: 'no-es-email' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un status fuera de ACTIVO/INACTIVO', async () => {
      await expect(
        service.create({ ...validDto, status: 'BORRADO' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza ConflictException si el DNI ya existe', async () => {
      repository.findOneBy.mockResolvedValue({ id: 5, dni: '39040338' });

      await expect(service.create(validDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('sin filtros devuelve todos los docentes', async () => {
      repository.find.mockResolvedValue([teacher]);

      await service.search();

      expect(repository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
      });
    });

    it('con apellido devuelve los docentes con sus cargos vigentes', async () => {
      repository.find.mockResolvedValue([teacher]);
      assignments.find.mockResolvedValue([
        { id: 9, teacher: { id: 1 }, positionType: { id: 2 } },
      ]);

      const result = await service.search(undefined, 'Gómez');

      expect(result[0].currentAssignments).toHaveLength(1);
      expect(result[0].currentAssignments[0].teacher).toBeUndefined();
    });

    it('lanza NotFoundException si la búsqueda no tiene resultados', async () => {
      repository.find.mockResolvedValue([]);

      await expect(service.search('39040338')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el docente no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza campos y mantiene los no enviados', async () => {
      repository.findOneBy.mockImplementation(() => Promise.resolve(teacher));
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { lastName: 'Pérez' });

      expect(result.lastName).toBe('Pérez');
      expect(result.firstName).toBe('Ana');
      expect(repository.save).toHaveBeenCalled();
    });

    it('verifica unicidad de DNI solo si cambió', async () => {
      repository.findOneBy.mockImplementation((where) =>
        Promise.resolve(where?.dni ? { id: 8, dni: '99999999' } : teacher),
      );
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      await expect(
        service.update(1, { dni: '99.999.999' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deactivate', () => {
    it('marca al docente como INACTIVO', async () => {
      repository.findOneBy.mockResolvedValue({ ...teacher });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.deactivate(1);

      expect(result.status).toBe('INACTIVO');
    });
  });

  describe('remove', () => {
    it('hace baja lógica del docente activo', async () => {
      repository.findOneBy.mockResolvedValue({ ...teacher });
      repository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.remove(1);

      expect(result.status).toBe('INACTIVO');
    });

    it('lanza ConflictException si ya está inactivo', async () => {
      repository.findOneBy.mockResolvedValue({
        ...teacher,
        status: 'INACTIVO',
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
