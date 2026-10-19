import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  IsNull,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { FOREIGN_KEY_VIOLATION } from '../../common/constants/database.constants';
import { findRef, requireDateOrder, requireInt } from '../../common/helpers';
import { CourseSectionSubject } from '../course-section-subjects/entities/course-section-subject.entity';
import { CourseSection } from '../course-sections/entities/course-section.entity';
import { PositionType } from '../position-types/entities/position-type.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import {
  DEFAULT_EXPIRING_DAYS,
  RELATIONS,
} from './constants/teacher-assignments.constants';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import {
  activeOn,
  addDays,
  overlapping,
  positionKind,
  today,
} from './teacher-assignments.helpers';

type Draft = Omit<TeacherAssignment, 'id'>;

@Injectable()
export class TeacherAssignmentsService {
  constructor(
    @InjectRepository(TeacherAssignment)
    private readonly repository: Repository<TeacherAssignment>,
  ) {}

  async create(dto: CreateTeacherAssignmentDto) {
    const draft = await this.build(dto);
    await this.validate(draft);
    const saved = await this.repository.save(this.repository.create(draft));
    return this.findOne(saved.id);
  }

  findAll(teacherId?: string) {
    const where: FindOptionsWhere<TeacherAssignment> = {};
    if (teacherId !== undefined) {
      where.teacher = { id: requireInt(Number(teacherId), 'teacherId') };
    }
    return this.repository.find({
      where,
      relations: RELATIONS,
      order: { startDate: 'DESC', id: 'ASC' },
    });
  }

  // HU-M2-09: cargos que vencen entre hoy y dentro de `days` días.
  findExpiring(days?: string) {
    const range =
      days === undefined
        ? DEFAULT_EXPIRING_DAYS
        : requireInt(Number(days), 'days');
    const from = today();
    return this.repository.find({
      where: { endDate: Between(from, addDays(from, range)) },
      relations: RELATIONS,
      order: { endDate: 'ASC', id: 'ASC' },
    });
  }

  // HU-M2-08: suplencias vigentes hoy, por división y ciclo lectivo.
  findActiveSubstitutions(courseSectionId?: string, academicCycleId?: string) {
    const where: FindOptionsWhere<TeacherAssignment> = {
      replacedAssignment: Not(IsNull()),
    };
    const courseSection: FindOptionsWhere<CourseSection> = {};
    if (courseSectionId !== undefined) {
      courseSection.id = requireInt(Number(courseSectionId), 'courseSectionId');
    }
    if (academicCycleId !== undefined) {
      courseSection.studyPlanAcademicCycle = {
        academicCycle: {
          id: requireInt(Number(academicCycleId), 'academicCycleId'),
        },
      };
    }
    if (Object.keys(courseSection).length) {
      where.courseSectionSubject = { courseSection };
    }
    return this.repository.find({
      where: activeOn(where),
      relations: RELATIONS,
      order: { endDate: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!item)
      throw new NotFoundException(`Teacher assignment ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateTeacherAssignmentDto) {
    const item = await this.findOne(id);
    const draft = await this.build(
      {
        teacherId: dto.teacherId ?? item.teacher.id,
        positionTypeId: dto.positionTypeId ?? item.positionType.id,
        courseSectionSubjectId:
          dto.courseSectionSubjectId ?? item.courseSectionSubject.id,
        // Se acepta null para sacar la referencia al cambiar de tipo de cargo.
        replacedAssignmentId:
          dto.replacedAssignmentId !== undefined
            ? dto.replacedAssignmentId
            : item.replacedAssignment?.id,
        weeklyHours: dto.weeklyHours ?? item.weeklyHours,
        startDate: dto.startDate ?? item.startDate,
        endDate: dto.endDate !== undefined ? dto.endDate : item.endDate,
      },
      item,
    );
    await this.validate(draft, id);

    const changesPlace =
      draft.courseSectionSubject.id !== item.courseSectionSubject.id ||
      draft.weeklyHours !== item.weeklyHours;
    if (changesPlace && (await this.hasSubstitutes(id))) {
      throw new ConflictException(
        `Teacher assignment ${id} has substitutes; its subject and hours cannot change`,
      );
    }
    await this.repository.save(Object.assign(item, draft));
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    try {
      return await this.repository.remove(item);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION
      ) {
        throw new ConflictException(
          `Teacher assignment ${id} has substitutes and cannot be deleted`,
        );
      }
      throw error;
    }
  }

  // Busca las referencias y aplica las reglas que dependen del tipo de cargo.
  // `previous` es la asignación que se está editando, si la hay.
  private async build(
    dto: CreateTeacherAssignmentDto,
    previous?: TeacherAssignment,
  ): Promise<Draft> {
    const manager = this.repository.manager;
    const teacher = await findRef(manager, Teacher, dto.teacherId, 'Teacher');
    const positionType = await findRef(
      manager,
      PositionType,
      dto.positionTypeId,
      'Position type',
    );
    // HU-M2-10: un docente inactivo no recibe asignaciones nuevas.
    if (teacher.status !== 'ACTIVO' && previous?.teacher.id !== teacher.id) {
      throw new BadRequestException(
        `Teacher ${teacher.id} is inactive and cannot receive new assignments`,
      );
    }
    if (
      positionType.status !== 'ACTIVO' &&
      previous?.positionType.id !== positionType.id
    ) {
      throw new BadRequestException(
        `Position type ${positionType.id} is inactive`,
      );
    }

    if (typeof dto.startDate !== 'string') {
      throw new BadRequestException('startDate is required');
    }
    const endDate = dto.endDate ?? null;
    requireDateOrder(dto.startDate, endDate, 'startDate', 'endDate');
    const dates = { startDate: dto.startDate, endDate };
    const { isSubstitute, isFixedTerm } = positionKind(positionType);

    if (isSubstitute) {
      return {
        teacher,
        positionType,
        ...dates,
        ...(await this.inheritFromTitular(dto, teacher, dates, previous)),
      };
    }

    if (dto.replacedAssignmentId != null) {
      throw new BadRequestException(
        'only substitute positions can set replacedAssignmentId',
      );
    }
    // HU-M2-05: los cargos a término necesitan fecha de fin.
    if (isFixedTerm && !endDate) {
      throw new BadRequestException(
        'endDate is required for fixed-term positions',
      );
    }
    const courseSectionSubject = await this.findCourseSectionSubject(
      dto.courseSectionSubjectId,
    );
    // HU-M2-03 y HU-M2-04: las horas tienen que coincidir con las del plan.
    const weeklyHours = requireInt(dto.weeklyHours, 'weeklyHours');
    const planHours = courseSectionSubject.subject.weeklyHours;
    if (weeklyHours !== planHours) {
      throw new BadRequestException(
        `weeklyHours (${weeklyHours}) must match the subject's weekly hours in the study plan (${planHours})`,
      );
    }
    return {
      teacher,
      positionType,
      ...dates,
      courseSectionSubject,
      weeklyHours,
      replacedAssignment: null,
    };
  }

  // HU-M2-07: el suplente hereda división y horas del titular, con su propia
  // vigencia, que tiene que caer dentro de la del titular.
  private async inheritFromTitular(
    dto: CreateTeacherAssignmentDto,
    teacher: Teacher,
    dates: { startDate: string; endDate: string | null },
    previous?: TeacherAssignment,
  ) {
    if (dto.replacedAssignmentId == null) {
      throw new BadRequestException(
        'a substitute position must set replacedAssignmentId (the titular it replaces)',
      );
    }
    const titularId = requireInt(
      dto.replacedAssignmentId,
      'replacedAssignmentId',
    );
    if (titularId === previous?.id) {
      throw new BadRequestException('an assignment cannot replace itself');
    }
    const titular = await this.findOne(titularId);
    if (
      positionKind(titular.positionType).isSubstitute ||
      !titular.positionType.allowsSubstitute
    ) {
      throw new BadRequestException(
        `Teacher assignment ${titularId} (${titular.positionType.name}) does not admit substitutes`,
      );
    }
    if (titular.teacher.id === teacher.id) {
      throw new BadRequestException(
        'the substitute must be a different teacher than the titular',
      );
    }
    if (
      dto.courseSectionSubjectId !== undefined &&
      dto.courseSectionSubjectId !== titular.courseSectionSubject.id
    ) {
      throw new BadRequestException(
        'a substitute inherits the course section subject of the titular',
      );
    }
    if (
      dto.weeklyHours !== undefined &&
      dto.weeklyHours !== titular.weeklyHours
    ) {
      throw new BadRequestException(
        'a substitute inherits the weekly hours of the titular',
      );
    }
    if (!dates.endDate) {
      throw new BadRequestException(
        'endDate is required for substitute positions',
      );
    }
    if (
      dates.startDate < titular.startDate ||
      (titular.endDate !== null && dates.endDate > titular.endDate)
    ) {
      throw new BadRequestException(
        `the substitution must fall within the titular's dates (${titular.startDate} to ${titular.endDate ?? 'no end date'})`,
      );
    }
    return {
      courseSectionSubject: titular.courseSectionSubject,
      weeklyHours: titular.weeklyHours,
      replacedAssignment: titular,
    };
  }

  // Reglas que dependen de las otras asignaciones con fechas que se cruzan.
  private async validate(draft: Draft, exceptId?: number) {
    const others: FindOptionsWhere<TeacherAssignment> = exceptId
      ? { id: Not(exceptId) }
      : {};
    const place = {
      courseSectionSubject: { id: draft.courseSectionSubject.id },
    };
    const { startDate, endDate } = draft;

    const duplicate = await this.repository.findOne({
      where: overlapping(
        { ...others, ...place, teacher: { id: draft.teacher.id } },
        startDate,
        endDate,
      ),
    });
    if (duplicate) {
      throw new ConflictException(
        `Teacher ${draft.teacher.id} already has an assignment in this course section subject for those dates (id ${duplicate.id})`,
      );
    }

    if (draft.replacedAssignment) {
      const titular = { id: draft.replacedAssignment.id };
      const otherSubstitute = await this.repository.findOne({
        where: overlapping(
          { ...others, replacedAssignment: titular },
          startDate,
          endDate,
        ),
      });
      if (otherSubstitute) {
        throw new ConflictException(
          `Teacher assignment ${titular.id} already has a substitute for those dates (id ${otherSubstitute.id})`,
        );
      }
      return;
    }

    // HU-M2-03: más de un titular solo si la materia lo permite, y sin pasar
    // el máximo. Los suplentes no cuentan porque reemplazan a un titular.
    const { allowsMultipleTeachers, maxTeachers } =
      draft.courseSectionSubject.subject;
    const titulars = await this.repository.count({
      where: overlapping(
        { ...others, ...place, replacedAssignment: IsNull() },
        startDate,
        endDate,
      ),
    });
    if (titulars > 0 && !allowsMultipleTeachers) {
      throw new ConflictException(
        'the subject does not allow more than one teacher in this course section',
      );
    }
    if (maxTeachers !== null && titulars >= maxTeachers) {
      throw new ConflictException(
        `the subject allows at most ${maxTeachers} teachers in this course section`,
      );
    }
  }

  private hasSubstitutes(id: number) {
    return this.repository.exists({
      where: { replacedAssignment: { id } },
    });
  }

  private async findCourseSectionSubject(id: unknown) {
    const item = await this.repository.manager.findOne(CourseSectionSubject, {
      where: { id: requireInt(id, 'courseSectionSubjectId') },
      relations: { subject: true },
    });
    if (!item) {
      throw new NotFoundException(
        `Course section subject ${id as number} not found`,
      );
    }
    return item;
  }
}
