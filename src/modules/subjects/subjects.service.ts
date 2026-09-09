import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { Subject } from './entities/subject.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(StudyPlan)
    private readonly studyPlanRepository: Repository<StudyPlan>,
  ) {}

  async create(createAsignaturaDto: CreateAsignaturaDto) {
    this.validateNombre(createAsignaturaDto.nombre);
    this.validateAnioCursada(createAsignaturaDto.anio_cursada);
    this.validateActiva(createAsignaturaDto.activa);
    const regimenDictado = this.validateRegimenDictado(
      createAsignaturaDto.regimen_dictado,
    );
    this.validateHorasSemanales(createAsignaturaDto.horas_catedra_semanales);
    this.validatePermiteMultiplesDocentes(
      createAsignaturaDto.permite_multiples_docentes,
    );
    const cantidadMaximaDocentes = this.validateCantidadMaximaDocentes(
      createAsignaturaDto.cantidad_maxima_docentes,
      createAsignaturaDto.permite_multiples_docentes,
    );
    this.validateId(createAsignaturaDto.plan_estudio_id);

    const planEstudio = await this.findStudyPlan(createAsignaturaDto.plan_estudio_id);
    const nombre = createAsignaturaDto.nombre.trim();
    await this.ensureUniqueNombre(nombre, planEstudio.id);
    const subject = this.subjectRepository.create({
      nombre,
      anio_cursada: createAsignaturaDto.anio_cursada,
      activa: createAsignaturaDto.activa ?? true,
      regimen_dictado: regimenDictado,
      horas_catedra_semanales: createAsignaturaDto.horas_catedra_semanales,
      permite_multiples_docentes: createAsignaturaDto.permite_multiples_docentes,
      cantidad_maxima_docentes: cantidadMaximaDocentes,
      plan_estudio: planEstudio,
    });

    return this.subjectRepository.save(subject);
  }

  findAll() {
    return this.subjectRepository.find({
      relations: { plan_estudio: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    this.validateId(id);
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: { plan_estudio: true },
    });

    if (!subject) {
      throw new NotFoundException(`No existe la asignatura con id ${id}`);
    }

    return subject;
  }

  async update(id: number, updateAsignaturaDto: UpdateAsignaturaDto) {
    const subject = await this.findOne(id);

    if (updateAsignaturaDto.nombre !== undefined) {
      this.validateNombre(updateAsignaturaDto.nombre);
      const nombre = updateAsignaturaDto.nombre.trim();
      await this.ensureUniqueNombre(
        nombre,
        updateAsignaturaDto.plan_estudio_id ?? subject.plan_estudio_id,
        subject.id,
      );
      subject.nombre = nombre;
    }

    if (updateAsignaturaDto.anio_cursada !== undefined) {
      this.validateAnioCursada(updateAsignaturaDto.anio_cursada);
      subject.anio_cursada = updateAsignaturaDto.anio_cursada;
    }

    if (updateAsignaturaDto.activa !== undefined) {
      this.validateActiva(updateAsignaturaDto.activa);
      subject.activa = updateAsignaturaDto.activa;
    }

    if (updateAsignaturaDto.regimen_dictado !== undefined) {
      subject.regimen_dictado = this.validateRegimenDictado(
        updateAsignaturaDto.regimen_dictado,
      );
    }

    if (updateAsignaturaDto.horas_catedra_semanales !== undefined) {
      this.validateHorasSemanales(updateAsignaturaDto.horas_catedra_semanales);
      subject.horas_catedra_semanales =
        updateAsignaturaDto.horas_catedra_semanales;
    }

    if (updateAsignaturaDto.permite_multiples_docentes !== undefined) {
      this.validatePermiteMultiplesDocentes(
        updateAsignaturaDto.permite_multiples_docentes,
      );
      subject.permite_multiples_docentes =
        updateAsignaturaDto.permite_multiples_docentes;
    }

    const cantidadMaximaDocentes =
      updateAsignaturaDto.cantidad_maxima_docentes ??
      subject.cantidad_maxima_docentes;
    subject.cantidad_maxima_docentes = this.validateCantidadMaximaDocentes(
      cantidadMaximaDocentes ?? undefined,
      subject.permite_multiples_docentes,
    );

    if (updateAsignaturaDto.plan_estudio_id !== undefined) {
      this.validateId(updateAsignaturaDto.plan_estudio_id);
      const planEstudio = await this.findStudyPlan(
        updateAsignaturaDto.plan_estudio_id,
      );
      await this.ensureUniqueNombre(subject.nombre, planEstudio.id, subject.id);
      subject.plan_estudio = planEstudio;
    }

    return this.subjectRepository.save(subject);
  }

  async remove(id: number) {
    const subject = await this.findOne(id);
    return this.subjectRepository.remove(subject);
  }

  private async findStudyPlan(id: number) {
    const studyPlan = await this.studyPlanRepository.findOneBy({ id });
    if (!studyPlan) {
      throw new NotFoundException(`No existe el plan de estudio con id ${id}`);
    }
    return studyPlan;
  }

  private async ensureUniqueNombre(
    nombre: string,
    planEstudioId: number,
    excludedId?: number,
  ) {
    const existingSubject = await this.subjectRepository.findOne({
      where: {
        nombre,
        plan_estudio: { id: planEstudioId },
      },
    });

    if (existingSubject && existingSubject.id !== excludedId) {
      throw new ConflictException(
        `La asignatura "${nombre}" ya existe en el plan de estudio con id ${planEstudioId}`,
      );
    }
  }

  private validateNombre(nombre: string) {
    if (typeof nombre !== 'string' || !nombre.trim()) {
      throw new BadRequestException('El nombre de la asignatura es obligatorio');
    }
  }

  private validateAnioCursada(anioCursada: number) {
    if (!Number.isInteger(anioCursada) || anioCursada <= 0) {
      throw new BadRequestException(
        'El anio_cursada debe ser un entero positivo',
      );
    }
  }

  private validateActiva(activa: boolean | undefined) {
    if (activa !== undefined && typeof activa !== 'boolean') {
      throw new BadRequestException('El campo activa debe ser booleano');
    }
  }

  private validateRegimenDictado(regimenDictado: string) {
    const regimenesPermitidos = ['Anual', 'Cuatrimestral', 'Trimestral'];
    if (
      typeof regimenDictado !== 'string' ||
      !regimenesPermitidos.includes(regimenDictado)
    ) {
      throw new BadRequestException(
        'El regimen_dictado debe ser Anual, Cuatrimestral o Trimestral',
      );
    }
    return regimenDictado;
  }

  private validateHorasSemanales(horasSemanales: number) {
    if (!Number.isFinite(horasSemanales) || horasSemanales <= 0) {
      throw new BadRequestException(
        'Las horas_catedra_semanales deben ser un numero positivo',
      );
    }
  }

  private validatePermiteMultiplesDocentes(permiteMultiplesDocentes: boolean) {
    if (typeof permiteMultiplesDocentes !== 'boolean') {
      throw new BadRequestException(
        'El campo permite_multiples_docentes debe ser booleano',
      );
    }
  }

  private validateCantidadMaximaDocentes(
    cantidadMaximaDocentes: number | undefined,
    permiteMultiplesDocentes: boolean,
  ) {
    if (!permiteMultiplesDocentes) {
      if (cantidadMaximaDocentes !== undefined && cantidadMaximaDocentes !== null) {
        throw new BadRequestException(
          'cantidad_maxima_docentes solo aplica cuando se permiten multiples docentes',
        );
      }
      return null;
    }

    if (
      cantidadMaximaDocentes === undefined ||
      !Number.isInteger(cantidadMaximaDocentes) ||
      cantidadMaximaDocentes <= 0
    ) {
      throw new BadRequestException(
        'cantidad_maxima_docentes debe ser un entero positivo cuando se permiten multiples docentes',
      );
    }
    return cantidadMaximaDocentes;
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El identificador debe ser un entero positivo');
    }
  }
}
