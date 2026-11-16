import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { DatabaseExceptionFilter } from './database-exception.filter';

function dbError(code: string, constraint?: string) {
  return new QueryFailedError('INSERT', [], {
    code,
    constraint,
  } as never);
}

describe('DatabaseExceptionFilter', () => {
  const filter = new DatabaseExceptionFilter();

  it('mapea unique_violation (23505) a ConflictException con el constraint', () => {
    const result = filter.toHttpException(
      dbError('23505', 'uq_plan_estudio_vigente'),
    );

    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.message).toContain('uq_plan_estudio_vigente');
  });

  it('mapea foreign_key_violation (23503) a BadRequestException', () => {
    expect(filter.toHttpException(dbError('23503'))).toBeInstanceOf(
      BadRequestException,
    );
  });

  it('mapea not_null_violation (23502) y check_violation (23514) a BadRequestException', () => {
    for (const code of ['23502', '23514']) {
      expect(filter.toHttpException(dbError(code))).toBeInstanceOf(
        BadRequestException,
      );
    }
  });

  it('devuelve null para errores de BD no mapeados', () => {
    expect(filter.toHttpException(dbError('42P01'))).toBeNull();
  });
});
