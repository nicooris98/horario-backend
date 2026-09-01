import { Injectable } from '@nestjs/common';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';

@Injectable()
export class AsignaturasService {
  create(createAsignaturaDto: CreateAsignaturaDto) {
    return 'This action adds a new asignatura';
  }

  findAll() {
    return `This action returns all asignaturas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asignatura`;
  }

  update(id: number, updateAsignaturaDto: UpdateAsignaturaDto) {
    return `This action updates a #${id} asignatura`;
  }

  remove(id: number) {
    return `This action removes a #${id} asignatura`;
  }
}
