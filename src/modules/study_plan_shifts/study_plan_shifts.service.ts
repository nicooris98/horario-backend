import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudyPlanShiftDto } from './dto/create-study_plan_shift.dto';
import { UpdateStudyPlanShiftDto } from './dto/update-study_plan_shift.dto';
import { StudyPlanShift } from './entities/study_plan_shift.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';
import { Shift } from '../shifts/entities/shifts.entity';

@Injectable()
export class StudyPlanShiftsService {
  constructor(
    @InjectRepository(StudyPlanShift)
    private studyPlanShiftRepository: Repository<StudyPlanShift>,
    @InjectRepository(StudyPlan)
    private studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
  ) {}

  async create(createStudyPlanShiftDto: CreateStudyPlanShiftDto) {
    this.validateId(createStudyPlanShiftDto.plan_estudio_id);
    this.validateId(createStudyPlanShiftDto.turno_id);

    const studyPlan = await this.findStudyPlan(
      createStudyPlanShiftDto.plan_estudio_id,
    );
    const shift = await this.findShift(createStudyPlanShiftDto.turno_id);
    await this.ensureUniqueAssociation(studyPlan.id, shift.id);

    const studyPlanShift = this.studyPlanShiftRepository.create({
      plan_estudio: studyPlan,
      turno: shift,
    });

    return this.studyPlanShiftRepository.save(studyPlanShift);
  }

  async findAll() {
    return this.studyPlanShiftRepository.find({
      relations: { plan_estudio: true, turno: true },
    });
  }

  async findOne(id: number) {
    const studyPlanShift = await this.studyPlanShiftRepository.findOne({
      where: { id },
      relations: { plan_estudio: true, turno: true },
    });

    if (!studyPlanShift) {
      throw new NotFoundException('Asociación entre plan y turno no encontrada');
    }

    return studyPlanShift;
  }

  async update(id: number, updateStudyPlanShiftDto: UpdateStudyPlanShiftDto) {
    const studyPlanShift = await this.findOne(id);
    const studyPlanId =
      updateStudyPlanShiftDto.plan_estudio_id ?? studyPlanShift.plan_estudio_id;
    const shiftId = updateStudyPlanShiftDto.turno_id ?? studyPlanShift.turno_id;

    this.validateId(studyPlanId);
    this.validateId(shiftId);

    if (updateStudyPlanShiftDto.plan_estudio_id !== undefined) {
      studyPlanShift.plan_estudio = await this.findStudyPlan(studyPlanId);
    }

    if (updateStudyPlanShiftDto.turno_id !== undefined) {
      studyPlanShift.turno = await this.findShift(shiftId);
    }

    await this.ensureUniqueAssociation(studyPlanId, shiftId, studyPlanShift.id);
    return this.studyPlanShiftRepository.save(studyPlanShift);
  }

  async remove(id: number) {
    const studyPlanShift = await this.findOne(id);
    return this.studyPlanShiftRepository.remove(studyPlanShift);
  }

  private async findStudyPlan(id: number) {
    const studyPlan = await this.studyPlanRepository.findOneBy({ id });
    if (!studyPlan) {
      throw new NotFoundException(`No existe el plan de estudio con id ${id}`);
    }
    return studyPlan;
  }

  private async findShift(id: number) {
    const shift = await this.shiftRepository.findOneBy({ id });
    if (!shift) {
      throw new NotFoundException(`No existe el turno con id ${id}`);
    }
    return shift;
  }

  private async ensureUniqueAssociation(
    studyPlanId: number,
    shiftId: number,
    excludedId?: number,
  ) {
    const existingAssociation = await this.studyPlanShiftRepository.findOne({
      where: {
        plan_estudio: { id: studyPlanId },
        turno: { id: shiftId },
      },
    });

    if (existingAssociation && existingAssociation.id !== excludedId) {
      throw new ConflictException(
        'El plan de estudio ya está asociado a ese turno',
      );
    }
  }

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException('El identificador debe ser un entero positivo');
    }
  }
}
