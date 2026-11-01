import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { DegreeService } from './degrees.service';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { Degree } from './entities/degrees.entity';

describe('DegreeService', () => {
  const degreeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };
  const service = new DegreeService(
    degreeRepository as unknown as Repository<Degree>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crea y devuelve una carrera con un nombre válido', async () => {
      const degree = { id: 1, name: 'Ingeniería' };
      degreeRepository.create.mockReturnValue(degree);
      degreeRepository.save.mockResolvedValue(degree);

      await expect(service.create({ name: ' Ingeniería ' })).resolves.toBe(
        degree,
      );
      expect(degreeRepository.create).toHaveBeenCalledWith({
        name: 'Ingeniería',
      });
      expect(degreeRepository.save).toHaveBeenCalledWith(degree);
    });

    it('rechaza un nombre vacío', async () => {
      expect(() => service.create({ name: '' })).toThrow(BadRequestException);
      expect(degreeRepository.create).not.toHaveBeenCalled();
    });

    it('rechaza un nombre que no es texto', async () => {
      expect(() =>
        service.create({ name: 123 as unknown as string }),
      ).toThrow(BadRequestException);
      expect(degreeRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('devuelve una carrera existente', async () => {
      const degree = { id: 1, name: 'Ingeniería' };
      degreeRepository.findOneBy.mockResolvedValue(degree);

      await expect(service.findOne(1)).resolves.toBe(degree);
      expect(degreeRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('lanza NotFoundException si la carrera no existe', async () => {
      degreeRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('devuelve las carreras ordenadas ascendentemente por id', async () => {
      const degrees = [
        { id: 1, name: 'Ingeniería' },
        { id: 2, name: 'Medicina' },
      ];
      degreeRepository.find.mockResolvedValue(degrees);

      await expect(service.findAll()).resolves.toBe(degrees);
      expect(degreeRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('actualiza una carrera existente con un nombre válido', async () => {
      const degree = { id: 1, name: 'Ingeniería' };
      degreeRepository.findOneBy.mockResolvedValue(degree);
      degreeRepository.save.mockImplementation((savedDegree) =>
        Promise.resolve(savedDegree),
      );

      await expect(
        service.update(1, { name: 'Informática' }),
      ).resolves.toEqual({ id: 1, name: 'Informática' });
      expect(degreeRepository.save).toHaveBeenCalledWith({
        id: 1,
        name: 'Informática',
      });
    });

    it('lanza NotFoundException si la carrera no existe', async () => {
      degreeRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'Informática' }),
      ).rejects.toThrow(NotFoundException);
      expect(degreeRepository.save).not.toHaveBeenCalled();
    });

    it('rechaza un nombre vacío', async () => {
      degreeRepository.findOneBy.mockResolvedValue({
        id: 1,
        name: 'Ingeniería',
      });

      await expect(service.update(1, { name: ' ' })).rejects.toThrow(
        BadRequestException,
      );
      expect(degreeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('elimina y devuelve una carrera sin planes asociados', async () => {
      const degree = { id: 1, name: 'Ingeniería' };
      degreeRepository.findOneBy.mockResolvedValue(degree);
      degreeRepository.remove.mockResolvedValue(degree);

      await expect(service.remove(1)).resolves.toBe(degree);
      expect(degreeRepository.remove).toHaveBeenCalledWith(degree);
    });

    it('lanza NotFoundException si la carrera no existe', async () => {
      degreeRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(degreeRepository.remove).not.toHaveBeenCalled();
    });

    it('convierte una violación FK en ConflictException con el mensaje acordado', async () => {
      const degree = { id: 1, name: 'Ingeniería' };
      degreeRepository.findOneBy.mockResolvedValue(degree);
      degreeRepository.remove.mockRejectedValue({
        driverError: { code: '23503' },
      });

      const error: unknown = await service.remove(1).then(
        () => null,
        (rejection: unknown) => rejection,
      );
      expect(error).toBeInstanceOf(ConflictException);
      expect(error).toHaveProperty('status', 409);
      expect(error).toHaveProperty(
        'message',
        'No se puede eliminar la carrera porque tiene planes de estudio asociados.',
      );
    });

    it('propaga errores que no son violaciones FK sin modificarlos', async () => {
      const degree = { id: 1, name: 'Ingeniería' };
      const error = new Error('database unavailable');
      degreeRepository.findOneBy.mockResolvedValue(degree);
      degreeRepository.remove.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toBe(error);
    });
  });
});

describe('CreateDegreeDto validation', () => {
  it('permite name como propiedad del DTO y valida su tipo, contenido y longitud', async () => {
    const validDto = Object.assign(new CreateDegreeDto(), {
      name: 'Ingeniería',
    });
    const emptyDto = Object.assign(new CreateDegreeDto(), { name: '' });
    const nonStringDto = Object.assign(new CreateDegreeDto(), { name: 123 });
    const longNameDto = Object.assign(new CreateDegreeDto(), {
      name: 'a'.repeat(256),
    });

    await expect(validate(validDto)).resolves.toHaveLength(0);
    await expect(validate(emptyDto)).resolves.not.toHaveLength(0);
    await expect(validate(nonStringDto)).resolves.not.toHaveLength(0);
    await expect(validate(longNameDto)).resolves.not.toHaveLength(0);
  });
});
