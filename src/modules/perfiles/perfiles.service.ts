import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfil } from './entities/perfil.entity';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class PerfilesService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
  ) {}

  create(createPerfilDto: CreatePerfilDto) {
    const perfil = this.perfilRepository.create(createPerfilDto);
    return this.perfilRepository.save(perfil);
  }

  findAll() {
    return this.perfilRepository.find({ relations: { perfilPermisos: true, userRoles: true } });
  }

  async findOne(id: number) {
    const perfil = await this.perfilRepository.findOne({
      where: { id },
      relations: { perfilPermisos: true, userRoles: true },
    });
    if (!perfil) {
      throw new NotFoundException(`Perfil #${id} not found`);
    }
    return perfil;
  }

  async update(id: number, updatePerfilDto: UpdatePerfilDto) {
    const perfil = await this.findOne(id);
    Object.assign(perfil, updatePerfilDto);
    return this.perfilRepository.save(perfil);
  }

  async remove(id: number) {
    const perfil = await this.findOne(id);
    await this.perfilRepository.softRemove(perfil);
    return perfil;
  }
}
