import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleOverlapService } from './schedule-overlap.service';
import { findRef, requireDateOrder } from '../../common/helpers';
import { CourseSectionSubject } from '../course-section-subjects/entities/course-section-subject.entity';
import { Semester } from '../semesters/entities/semester.entity';
import { ClassHour } from '../class-hours/entities/class-hour.entity';
import { Day } from './entities/day.entity';

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
    const refs = await this.resolveRefs(dto);
    const schedule = this.repository.create({
      courseSectionSubject: refs.courseSectionSubject,
      semester: refs.semester,
      classHour: refs.classHour,
      day: refs.day,
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
    const refs = await this.resolveRefs({
      idCursado: merged.idCursado,
      idCuatrimestre: merged.idCuatrimestre,
      idHoraCatedra: merged.idHoraCatedra,
      idDia: merged.idDia,
    });
    await this.repository.save({
      id,
      courseSectionSubject: refs.courseSectionSubject,
      semester: refs.semester,
      classHour: refs.classHour,
      day: refs.day,
      startDate: merged.fechaDesde,
      endDate: merged.fechaHasta || null,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    // RN-11: los horarios no se borran físicamente; se marcan como finalizados.
    const schedule = await this.findOne(id);
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);
    if (schedule.endDate !== null && schedule.endDate <= today) {
      throw new ConflictException(`El horario #${id} ya está finalizado`);
    }
    schedule.endDate =
      schedule.startDate > today ? schedule.startDate : today;
    return this.repository.save(schedule);
  }

  private resolveRefs(ids: {
    idCursado: number;
    idCuatrimestre: number;
    idHoraCatedra: number;
    idDia: number;
  }) {
    const manager = this.repository.manager;
    return Promise.all([
      findRef(manager, CourseSectionSubject, ids.idCursado, 'Course section subject'),
      findRef(manager, Semester, ids.idCuatrimestre, 'Semester'),
      findRef(manager, ClassHour, ids.idHoraCatedra, 'Class hour'),
      findRef(manager, Day, ids.idDia, 'Day'),
    ]).then(([courseSectionSubject, semester, classHour, day]) => ({
      courseSectionSubject,
      semester,
      classHour,
      day,
    }));
  }
}