import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudyPlanDto } from './dto/create-study_plans.dto';
import { UpdateStudyPlanDto } from './dto/update-study_plans.dto';
import { StudyPlan } from './entities/study_plans.entity';
import { Degree } from '../degrees/entities/degrees.entity';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectRepository(StudyPlan)
    private studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(Degree)
    private degreeRepository: Repository<Degree>,
  ) {}

  async create(createStudyPlanDto: CreateStudyPlanDto) {
    this.validateNombre(createStudyPlanDto.nombre);
    this.validateCarreraId(createStudyPlanDto.carrera_id);
    this.validateFecha(createStudyPlanDto.fecha_desde, 'fecha_desde');
    if (createStudyPlanDto.fecha_hasta !== undefined && createStudyPlanDto.fecha_hasta !== null) {
      this.validateFecha(createStudyPlanDto.fecha_hasta, 'fecha_hasta');
    }
    this.validateFechaHasta(createStudyPlanDto.fecha_desde, createStudyPlanDto.fecha_hasta);
    this.validateEstado(createStudyPlanDto.estado);
    this.validateResolucionMinisterial(createStudyPlanDto.resolucion_ministerial);
    this.validateAnioImplementacion(createStudyPlanDto.anio_implementacion);

    const carrera = await this.findCarrera(createStudyPlanDto.carrera_id);
    const resolucionMinisterial =
      createStudyPlanDto.resolucion_ministerial.trim();
    await this.ensureUniqueResolution(resolucionMinisterial);

    const studyPlan = this.studyPlanRepository.create({
      nombre: createStudyPlanDto.nombre.trim(),
      carrera,
      fecha_desde: createStudyPlanDto.fecha_desde,
      fecha_hasta: createStudyPlanDto.fecha_hasta ?? null,
      estado: createStudyPlanDto.estado ?? true,
      resolucion_ministerial: resolucionMinisterial,
      anio_implementacion: createStudyPlanDto.anio_implementacion,
    });

    return this.studyPlanRepository.save(studyPlan);
  }

  async findAll() {
    const plans = await this.studyPlanRepository.find({ relations: { carrera: true } });
    if (!plans || plans.length === 0) {
      throw new NotFoundException('No se encontraron planes de estudio');
    }
    return plans;
  }

  async findOne(id: number) {
    const studyPlan = await this.studyPlanRepository.findOne({
      where: { id },
      relations: { carrera: true },
    });
    if (!studyPlan) {
      throw new NotFoundException('Plan de estudio no encontrado');
    }
    return studyPlan;
  }

  async update(id: number, updateStudyPlanDto: UpdateStudyPlanDto) {
    const studyPlan = await this.findOne(id);

    if (updateStudyPlanDto.nombre !== undefined) {
      this.validateNombre(updateStudyPlanDto.nombre);
      studyPlan.nombre = updateStudyPlanDto.nombre.trim();
    }

    if (updateStudyPlanDto.carrera_id !== undefined) {
      this.validateCarreraId(updateStudyPlanDto.carrera_id);
      studyPlan.carrera = await this.findCarrera(updateStudyPlanDto.carrera_id);
    }

    const fechaDesde = updateStudyPlanDto.fecha_desde ?? studyPlan.fecha_desde;
    const fechaHasta =
      updateStudyPlanDto.fecha_hasta !== undefined
        ? updateStudyPlanDto.fecha_hasta
        : studyPlan.fecha_hasta;
    if (updateStudyPlanDto.fecha_desde !== undefined) {
      this.validateFecha(updateStudyPlanDto.fecha_desde, 'fecha_desde');
      studyPlan.fecha_desde = updateStudyPlanDto.fecha_desde;
    }
    if (updateStudyPlanDto.fecha_hasta !== undefined) {
      if (updateStudyPlanDto.fecha_hasta !== null) {
        this.validateFecha(updateStudyPlanDto.fecha_hasta, 'fecha_hasta');
      }
      studyPlan.fecha_hasta = updateStudyPlanDto.fecha_hasta;
    }
    if (
      updateStudyPlanDto.fecha_desde !== undefined ||
      updateStudyPlanDto.fecha_hasta !== undefined
    ) {
      this.validateFechaHasta(fechaDesde, fechaHasta ?? undefined);
    }

    if (updateStudyPlanDto.estado !== undefined) {
      this.validateEstado(updateStudyPlanDto.estado);
      studyPlan.estado = updateStudyPlanDto.estado;
    }

    if (updateStudyPlanDto.resolucion_ministerial !== undefined) {
      this.validateResolucionMinisterial(
        updateStudyPlanDto.resolucion_ministerial,
      );
      const resolucionMinisterial =
        updateStudyPlanDto.resolucion_ministerial.trim();
      await this.ensureUniqueResolution(resolucionMinisterial, studyPlan.id);
      studyPlan.resolucion_ministerial =
        resolucionMinisterial;
    }

    if (updateStudyPlanDto.anio_implementacion !== undefined) {
      this.validateAnioImplementacion(updateStudyPlanDto.anio_implementacion);
      studyPlan.anio_implementacion = updateStudyPlanDto.anio_implementacion;
    }

    return this.studyPlanRepository.save(studyPlan);
  }

  async remove(id: number) {
    const studyPlan = await this.findOne(id);
    return this.studyPlanRepository.remove(studyPlan);
  }

  private async findCarrera(carreraId: number) {
    const carrera = await this.degreeRepository.findOneBy({ id: carreraId });
    if (!carrera) {
      throw new NotFoundException(`No existe la carrera con id ${carreraId}`);
    }
    return carrera;
  }

  private async ensureUniqueResolution(
    resolucionMinisterial: string,
    excludedId?: number,
  ) {
    const existingPlan = await this.studyPlanRepository.findOneBy({
      resolucion_ministerial: resolucionMinisterial,
    });

    if (existingPlan && existingPlan.id !== excludedId) {
      throw new ConflictException(
        `La resolución ministerial ${resolucionMinisterial} ya está registrada`,
      );
    }
  }

  private validateNombre(nombre: string) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
      throw new BadRequestException('El nombre es obligatorio');
    }
  }

  private validateCarreraId(carreraId: number) {
    if (!Number.isInteger(carreraId) || carreraId <= 0) {
      throw new BadRequestException('El carrera_id debe ser un entero positivo');
    }
  }

  private validateFecha(fecha: string | undefined, campo: string) {
    if (!fecha || Number.isNaN(Date.parse(fecha))) {
      throw new BadRequestException(`El campo ${campo} debe ser una fecha valida`);
    }
  }

  private validateFechaHasta(fechaDesde: string, fechaHasta?: string | null) {
    if (fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)) {
      throw new BadRequestException(
        'La fecha_hasta no puede ser anterior a la fecha_desde',
      );
    }
  }

  private validateEstado(estado: boolean | undefined) {
    if (estado !== undefined && typeof estado !== 'boolean') {
      throw new BadRequestException('El campo estado debe ser booleano');
    }
  }

  private validateResolucionMinisterial(resolucionMinisterial: string) {
    if (typeof resolucionMinisterial !== 'string' || !resolucionMinisterial.trim()) {
      throw new BadRequestException('La resolucion_ministerial es obligatoria');
    }
  }

  private validateAnioImplementacion(anioImplementacion: number) {
    if (!Number.isInteger(anioImplementacion) || anioImplementacion <= 0) {
      throw new BadRequestException('El anio_implementacion debe ser un entero positivo');
    }
  }
}
