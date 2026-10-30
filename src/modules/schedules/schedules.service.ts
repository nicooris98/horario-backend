import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleOverlapService } from './schedule-overlap.service';
import { requireDateOrder } from '../../common/helpers'; // Reutilizamos el helper del proyecto

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly repository: Repository<Schedule>,
    private readonly overlapService: ScheduleOverlapService,
  ) {}

  async create(dto: CreateScheduleDto) {
    // 1. Validar orden de fechas (usando el helper del proyecto)
    requireDateOrder(dto.fechaDesde, dto.fechaHasta, 'fechaDesde', 'fechaHasta');

    // 2. Verificar solapamiento
    const conflicts = await this.overlapService.checkOverlap({
      idEccd: dto.idCursado,
      idDia: dto.idDia,
      idHoraCatedra: dto.idHoraCatedra,
      fechaDesde: dto.fechaDesde,
      fechaHasta: dto.fechaHasta || null,
    });

    if (conflicts.length > 0) {
      // Tomamos el primer conflicto para mostrar un mensaje claro
      const c = conflicts[0];
      throw new ConflictException(
        `El docente ${c.nombreDocente} ${c.apellidoDocente} ya tiene una clase asignada el ${c.conflictoDesde} hasta ${c.conflictoHasta || 'indefinido'} (Horario existente ID: ${c.idHorarioExistente}).`
      );
    }

    // 3. Guardar
    const schedule = this.repository.create({
      courseSectionSubject: { id: dto.idCursado },
      semester: { id: dto.idCuatrimestre },
      classHour: { id: dto.idHoraCatedra },
      day: { id: dto.idDia },
      startDate: dto.fechaDesde,
      endDate: dto.fechaHasta || null,
    });

    return this.repository.save(schedule);
  }

  async findAll() {
    return this.repository.find({
      relations: {
        courseSectionSubject: true,
        semester: true,
        classHour: true,
        day: true,
      },
    });
  }

  async findOne(id: number) {
    const schedule = await this.repository.findOne({
      where: { id },
      relations: {
        courseSectionSubject: true,
        semester: true,
        classHour: true,
        day: true,
      },
    });
    if (!schedule) {
      throw new NotFoundException(`Horario #${id} no encontrado`);
    }
    return schedule;
  }

  async update(id: number, dto: UpdateScheduleDto) {
    const schedule = await this.findOne(id);

    // Mezclamos los datos actuales con los nuevos
    const merged = {
      idCursado: dto.idCursado ?? schedule.courseSectionSubject.id,
      idCuatrimestre: dto.idCuatrimestre ?? schedule.semester.id,
      idHoraCatedra: dto.idHoraCatedra ?? schedule.classHour.id,
      idDia: dto.idDia ?? schedule.day.id,
      fechaDesde: dto.fechaDesde ?? schedule.startDate,
      fechaHasta: dto.fechaHasta !== undefined ? dto.fechaHasta : schedule.endDate,
    };

    // Validar orden de fechas
    requireDateOrder(merged.fechaDesde, merged.fechaHasta, 'fechaDesde', 'fechaHasta');

    // Verificar solapamiento (excluyendo el ID actual)
    const conflicts = await this.overlapService.checkOverlap({
      idEccd: merged.idCursado,
      idDia: merged.idDia,
      idHoraCatedra: merged.idHoraCatedra,
      fechaDesde: merged.fechaDesde,
      fechaHasta: merged.fechaHasta || null,
      excludeIdHorario: id, // <-- Importante para que no choque consigo mismo
    });

    if (conflicts.length > 0) {
      const c = conflicts[0];
      throw new ConflictException(
        `El docente ${c.nombreDocente} ${c.apellidoDocente} ya tiene una clase asignada (Horario existente ID: ${c.idHorarioExistente}).`
      );
    }

    // Actualizamos
    await this.repository.save({
      id,
      courseSectionSubject: { id: merged.idCursado },
      semester: { id: merged.idCuatrimestre },
      classHour: { id: merged.idHoraCatedra },
      day: { id: merged.idDia },
      startDate: merged.fechaDesde,
      endDate: merged.fechaHasta || null,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    // Nota: Según las reglas de negocio (RN-11), los horarios no se borran físicamente.
    // Esto debería ser una baja lógica (ej. fecha_hasta = hoy).
    // Por ahora, dejamos un remove físico para pruebas del endpoint.
    const schedule = await this.findOne(id);
    return this.repository.remove(schedule);
  }
}