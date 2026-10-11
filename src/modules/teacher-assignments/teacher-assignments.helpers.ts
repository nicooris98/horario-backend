import {
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { PositionType } from '../position-types/entities/position-type.entity';
import { POSITION_TYPE_NAMES } from './constants/teacher-assignments.constants';
import { TeacherAssignment } from './entities/teacher-assignment.entity';

type Where = FindOptionsWhere<TeacherAssignment>;

// Fecha local en formato YYYY-MM-DD, igual que devuelve una columna date.
export function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function addDays(date: string, days: number) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

// Asignaciones cuya vigencia se cruza con [start, end]. Sin end = indefinida.
// TypeORM 1.x no acepta propiedades undefined en un where, por eso se arma
// cada condición solo si hace falta.
export function overlapping(where: Where, start: string, end: string | null) {
  const base: Where = end
    ? { ...where, startDate: LessThanOrEqual(end) }
    : where;
  return [
    { ...base, endDate: IsNull() },
    { ...base, endDate: MoreThanOrEqual(start) },
  ];
}

export function activeOn(where: Where, date = today()) {
  return overlapping(where, date, date);
}

export function positionKind(positionType: PositionType) {
  const name = positionType.name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
  return {
    isSubstitute: name === POSITION_TYPE_NAMES.SUBSTITUTE,
    isFixedTerm: name === POSITION_TYPE_NAMES.FIXED_TERM,
  };
}
