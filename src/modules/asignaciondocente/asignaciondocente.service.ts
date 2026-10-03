import { Injectable } from '@nestjs/common';
import { CreateAsignaciondocenteDto } from './dto/create-asignaciondocente.dto';
import { UpdateAsignaciondocenteDto } from './dto/update-asignaciondocente.dto';

@Injectable()
export class AsignaciondocenteService {
  create(createAsignaciondocenteDto: CreateAsignaciondocenteDto) {
    return 'This action adds a new asignaciondocente';
  }

  findAll() {
    return `This action returns all asignaciondocente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asignaciondocente`;
  }

  update(id: number, updateAsignaciondocenteDto: UpdateAsignaciondocenteDto) {
    return `This action updates a #${id} asignaciondocente`;
  }

  remove(id: number) {
    return `This action removes a #${id} asignaciondocente`;
  }
}
