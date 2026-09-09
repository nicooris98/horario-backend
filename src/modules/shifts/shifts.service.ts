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
    this.validateActivo(createShiftDto.activo);
    const nombre = this.normalizeNombre(createShiftDto.nombre);
    await this.ensureUniqueNombre(nombre);
    const shift = this.shiftRepository.create({
      nombre,
      activo: createShiftDto.activo ?? true,
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

    if (updateShiftDto.activo !== undefined) {
      this.validateActivo(updateShiftDto.activo);
      shift.activo = updateShiftDto.activo;
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

  private validateActivo(activo: boolean | undefined) {
    if (activo !== undefined && typeof activo !== 'boolean') {
      throw new BadRequestException('El campo activo debe ser booleano');
    }
  }
}
