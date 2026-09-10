import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shifts.dto';
import { UpdateShiftDto } from './dto/update-shifts.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shift } from './entities/shifts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShiftService {
  @InjectRepository(Shift)
  private shiftRepository: Repository<Shift>;
  
  async create(createShiftDto: CreateShiftDto) {
    this.validateNombre(createShiftDto.nombre);
    this.validateHorario(createShiftDto.hora_inicio, createShiftDto.hora_fin);
    this.validateEstado(createShiftDto.estado);
    const nombre = this.normalizeNombre(createShiftDto.nombre);
    await this.ensureUniqueNombre(nombre);
    const shift = this.shiftRepository.create({
      nombre,
      hora_inicio: createShiftDto.hora_inicio,
      hora_fin: createShiftDto.hora_fin,
      estado: createShiftDto.estado ?? true,
    });
    return this.shiftRepository.save(shift);
  }

  async findAll() {
    const shifts = await this.shiftRepository.find();
    if (!shifts || shifts.length === 0) {
      throw new NotFoundException('No se encontraron turnos');
    }
    return shifts;
  }

  async findOne(id: number) {
    const shift = await this.shiftRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException('Turno no encontrado');
    }
    return shift;
  }

  async update(id: number, updateShiftDto: UpdateShiftDto) {
    const shift = await this.findOne(id);

    if (updateShiftDto.nombre !== undefined) {
      this.validateNombre(updateShiftDto.nombre);
      const nombre = this.normalizeNombre(updateShiftDto.nombre);
      await this.ensureUniqueNombre(nombre, shift.id);
      shift.nombre = nombre;
    }

    const horaInicio = updateShiftDto.hora_inicio ?? shift.hora_inicio;
    const horaFin = updateShiftDto.hora_fin ?? shift.hora_fin;
    if (
      updateShiftDto.hora_inicio !== undefined ||
      updateShiftDto.hora_fin !== undefined
    ) {
      this.validateHorario(horaInicio, horaFin);
      shift.hora_inicio = horaInicio;
      shift.hora_fin = horaFin;
    }

    if (updateShiftDto.estado !== undefined) {
      this.validateEstado(updateShiftDto.estado);
      shift.estado = updateShiftDto.estado;
    }

    return this.shiftRepository.save(shift);
  }

  async remove(id: number) {
    const shift = await this.findOne(id);
    return this.shiftRepository.remove(shift);
  }

  private validateNombre(nombre: string) {
    if (!nombre || nombre.trim() === '') {
      throw new BadRequestException('El nombre del turno es obligatorio');
    }
  }

  private normalizeNombre(nombre: string) {
    return nombre.trim().toLowerCase();
  }

  private async ensureUniqueNombre(nombre: string, excludedId?: number) {
    const existingShift = await this.shiftRepository.findOneBy({ nombre });

    if (existingShift && existingShift.id !== excludedId) {
      throw new ConflictException(`El turno "${nombre}" ya está registrado`);
    }
  }

  private validateEstado(estado: boolean | undefined) {
    if (estado !== undefined && typeof estado !== 'boolean') {
      throw new BadRequestException('El campo estado debe ser booleano');
    }
  }

  private validateHorario(horaInicio: string, horaFin: string) {
    const horaPattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!horaPattern.test(horaInicio) || !horaPattern.test(horaFin)) {
      throw new BadRequestException(
        'hora_inicio y hora_fin deben tener el formato HH:mm',
      );
    }

    if (this.toMinutes(horaFin) <= this.toMinutes(horaInicio)) {
      throw new BadRequestException(
        'hora_fin debe ser posterior a hora_inicio',
      );
    }
  }

  private toMinutes(hora: string) {
    const [hours, minutes] = hora.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
