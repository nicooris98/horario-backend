import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from './entities/docente.entity';   // carpeta entities
import { CreateDocenteDto } from './dto/create-docente.dto'; // carpeta dto
import { UpdateDocenteDto } from './dto/update-docente.dto'; // carpeta dto


@Injectable()
export class DocentesService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,
  ) {}

  findAll(): Promise<Docente[]> {
    return this.docenteRepository.find();
  }

  findOne(id: number): Promise<Docente | null> {
    return this.docenteRepository.findOneBy({ id });
  }

  create(dto: CreateDocenteDto): Promise<Docente> {
    const nuevo = this.docenteRepository.create(dto);
    return this.docenteRepository.save(nuevo);
  }

  async update(id: number, dto: UpdateDocenteDto): Promise<Docente | null> {
    await this.docenteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.docenteRepository.delete(id);
  }
}
