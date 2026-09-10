import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDegreeDto } from './dto/create-degrees.dto';
import { UpdateDegreeDto } from './dto/update-degrees.dto';
import { Degree } from './entities/degrees.entity';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(Degree)
    private readonly degreeRepository: Repository<Degree>,
  ) {}

  create(createDegreeDto: CreateDegreeDto) {
    this.validateNombre(createDegreeDto.nombre);
    this.validateDuracionAnios(createDegreeDto.duracion_anios);
    this.validateEstado(createDegreeDto.estado);

    const degree = this.degreeRepository.create({
      nombre: createDegreeDto.nombre.trim(),
      duracion_anios: createDegreeDto.duracion_anios,
      estado: createDegreeDto.estado ?? true,
    });

    return this.degreeRepository.save(degree);
  }

  findAll() {
    return this.degreeRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const degree = await this.degreeRepository.findOneBy({ id });

    if (!degree) {
      throw new NotFoundException(`No existe la carrera con id ${id}`);
    }

    return degree;
  }

  async update(id: number, updateDegreeDto: UpdateDegreeDto) {
    const degree = await this.findOne(id);

    if (updateDegreeDto.nombre !== undefined) {
      this.validateNombre(updateDegreeDto.nombre);
      degree.nombre = updateDegreeDto.nombre.trim();
    }

    if (updateDegreeDto.duracion_anios !== undefined) {
      this.validateDuracionAnios(updateDegreeDto.duracion_anios);
      degree.duracion_anios = updateDegreeDto.duracion_anios;
    }

    if (updateDegreeDto.estado !== undefined) {
      this.validateEstado(updateDegreeDto.estado);
      degree.estado = updateDegreeDto.estado;
    }

    return this.degreeRepository.save(degree);
  }

  async remove(id: number) {
    const degree = await this.findOne(id);
    await this.degreeRepository.remove(degree);
    return degree;
  }

  private validateNombre(nombre: string) {
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      throw new BadRequestException('nombre es obligatorio');
    }
  }

  private validateEstado(estado: boolean | undefined) {
    if (estado !== undefined && typeof estado !== 'boolean') {
      throw new BadRequestException('estado debe ser booleano');
    }
  }

  private validateDuracionAnios(duracionAnios: number) {
    if (!Number.isInteger(duracionAnios) || duracionAnios <= 0) {
      throw new BadRequestException(
        'duracion_anios debe ser un entero positivo',
      );
    }
  }
}
