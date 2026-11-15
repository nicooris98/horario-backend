import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

// Errores de PostgreSQL que indican un problema de datos enviado por el
// cliente (duplicados, referencias inexistentes, nulos, checks). El resto
// sigue el flujo normal y termina en 500.
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';
const NOT_NULL_VIOLATION = '23502';
const CHECK_VIOLATION = '23514';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter extends BaseExceptionFilter {
  override catch(exception: QueryFailedError, host: ArgumentsHost) {
    const mapped = this.toHttpException(exception);
    return super.catch(mapped ?? exception, host);
  }

  toHttpException(error: QueryFailedError): HttpException | null {
    const driverError = error.driverError as
      | { code?: string; constraint?: string }
      | undefined;
    const code = driverError?.code;
    const detail = driverError?.constraint
      ? ` (constraint: ${driverError.constraint})`
      : '';

    switch (code) {
      case UNIQUE_VIOLATION:
        return new ConflictException(
          `La operación genera un valor duplicado${detail}`,
        );
      case FOREIGN_KEY_VIOLATION:
        return new BadRequestException(
          `La operación referencia un registro inexistente${detail}`,
        );
      case NOT_NULL_VIOLATION:
      case CHECK_VIOLATION:
        return new BadRequestException(
          `La operación viola una restricción de integridad${detail}`,
        );
      default:
        return null;
    }
  }
}
