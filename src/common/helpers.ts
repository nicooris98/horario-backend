import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';

export function requireText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} is required`);
  }
  return value.trim();
}

export function requireInt(value: unknown, field: string) {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new BadRequestException(`${field} must be a positive integer`);
  }
  return value as number;
}

export function requirePositive(value: unknown, field: string) {
  if (!Number.isFinite(value) || (value as number) <= 0) {
    throw new BadRequestException(`${field} must be positive`);
  }
  return value as number;
}

export function optionalStatus(value: unknown) {
  if (value !== undefined) requireText(value, 'status');
}

export function parseDate(value: string, field: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${field} must use the YYYY-MM-DD format`);
  }
  return date;
}

export function parseTime(value: string, field: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
    throw new BadRequestException(
      `${field} must use the HH:mm or HH:mm:ss format`,
    );
  }
  const [hours, minutes, seconds = 0] = value.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export function requireDateOrder(
  from: string,
  to: string | null | undefined,
  fromField: string,
  toField: string,
) {
  const start = parseDate(from, fromField);
  if (to != null && parseDate(to, toField) < start) {
    throw new BadRequestException(`${toField} must be on or after ${fromField}`);
  }
}

export function requireTimeOrder(from: string, to: string) {
  if (parseTime(to, 'endTime') <= parseTime(from, 'startTime')) {
    throw new BadRequestException('endTime must be after startTime');
  }
}

export async function findRef<T extends ObjectLiteral>(
  manager: EntityManager,
  entity: EntityTarget<T>,
  id: unknown,
  label: string,
): Promise<T> {
  requireInt(id, `${label} id`);
  const found = await manager.findOneBy(entity, { id } as FindOptionsWhere<T>);
  if (!found) throw new NotFoundException(`${label} ${id as number} not found`);
  return found;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]) {
  return Object.fromEntries(
    keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]),
  ) as Partial<Pick<T, K>>;
}
