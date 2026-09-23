import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from './entities/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  create(createPermisoDto: CreatePermisoDto) {
    const permiso = this.permisoRepository.create(createPermisoDto);
    return this.permisoRepository.save(permiso);
  }

  findAll() {
    return this.permisoRepository.find({ relations: { perfilPermisos: true } });
  }

  async findOne(id: number) {
    const permiso = await this.permisoRepository.findOne({
      where: { id },
      relations: { perfilPermisos: true },
    });
    if (!permiso) {
      throw new NotFoundException(`Permiso #${id} not found`);
    }
    return permiso;
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto) {
    const permiso = await this.findOne(id);
    Object.assign(permiso, updatePermisoDto);
    return this.permisoRepository.save(permiso);
  }

  async remove(id: number) {
    const permiso = await this.findOne(id);
    await this.permisoRepository.softRemove(permiso);
    return permiso;
  }
}
