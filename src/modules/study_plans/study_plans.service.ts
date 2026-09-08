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
    this.validateDuracion(createStudyPlanDto.duracion);
    this.validateVigente(createStudyPlanDto.vigente);
    this.validateActiva(createStudyPlanDto.activa);
    this.validateResolucionMinisterial(createStudyPlanDto.resolucion_ministerial);
    this.validateAnioImplementacion(createStudyPlanDto.anio_implementacion);

    const carrera = await this.findCarrera(createStudyPlanDto.carrera_id);
    const resolucionMinisterial =
      createStudyPlanDto.resolucion_ministerial.trim();
    await this.ensureUniqueResolution(resolucionMinisterial);

    const vigente = createStudyPlanDto.vigente ?? false;
    const activa = createStudyPlanDto.activa ?? true;
    if (vigente) {
      await this.ensureNoVigentePlan(createStudyPlanDto.carrera_id);
    }

    const studyPlan = this.studyPlanRepository.create({
      nombre: createStudyPlanDto.nombre.trim(),
      carrera,
      duracion: createStudyPlanDto.duracion,
      vigente,
      activa,
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
      if (studyPlan.vigente) {
        await this.ensureNoVigentePlan(updateStudyPlanDto.carrera_id, studyPlan.id);
      }
    }

    if (updateStudyPlanDto.duracion !== undefined) {
      this.validateDuracion(updateStudyPlanDto.duracion);
      studyPlan.duracion = updateStudyPlanDto.duracion;
    }

    if (updateStudyPlanDto.vigente !== undefined) {
      this.validateVigente(updateStudyPlanDto.vigente);
      if (updateStudyPlanDto.vigente) {
        await this.ensureNoVigentePlan(
          updateStudyPlanDto.carrera_id ?? studyPlan.carrera_id,
          studyPlan.id,
        );
      }
      studyPlan.vigente = updateStudyPlanDto.vigente;
    }

    if (updateStudyPlanDto.activa !== undefined) {
      this.validateActiva(updateStudyPlanDto.activa);
      studyPlan.activa = updateStudyPlanDto.activa;
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

  private async ensureNoVigentePlan(carreraId: number, excludedId?: number) {
    const vigentePlan = await this.studyPlanRepository.findOne({
      where: {
        carrera: { id: carreraId },
        vigente: true,
      },
    });

    if (vigentePlan && vigentePlan.id !== excludedId) {
      throw new ConflictException(
        `La carrera con id ${carreraId} ya tiene un plan de estudio vigente`,
      );
    }
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

  private validateDuracion(duracion: number) {
    if (!Number.isFinite(duracion) || duracion <= 0) {
      throw new BadRequestException('La duracion debe ser un numero positivo');
    }
  }

  private validateVigente(vigente: boolean | undefined) {
    if (vigente !== undefined && typeof vigente !== 'boolean') {
      throw new BadRequestException('El campo vigente debe ser booleano');
    }
  }

  private validateActiva(activa: boolean | undefined) {
    if (activa !== undefined && typeof activa !== 'boolean') {
      throw new BadRequestException('El campo activa debe ser booleano');
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
