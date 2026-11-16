import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiSuccess(
  status: 200 | 201,
  description: string,
  example?: unknown,
) {
  const isArray = Array.isArray(example);
  return ApiResponse({
    status,
    description,
    schema: {
      type: isArray ? 'array' : 'object',
      ...(isArray ? { items: { type: 'object' } } : {}),
      ...(example !== undefined ? { example } : {}),
    },
  });
}

interface ApiErrorResponsesOptions {
  access?: string;
  badRequest?: string;
  notFound?: string;
  conflict?: string;
}

export function ApiErrorResponses({
  access,
  badRequest,
  notFound,
  conflict,
}: ApiErrorResponsesOptions = {}) {
  const decorators = [
    ...(badRequest
      ? [
          ApiResponse({
            status: 400,
            description: badRequest,
            schema: {
              example: {
                statusCode: 400,
                message: [badRequest],
                error: 'Bad Request',
              },
            },
          }),
        ]
      : []),
    ApiResponse({
      status: 401,
      description:
        'Usuario no autenticado. Token JWT ausente, inválido o expirado.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: access
        ? `Usuario sin permisos. Requiere ${access}.`
        : 'Usuario sin permisos para acceder a este recurso.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ...(notFound
      ? [
          ApiResponse({
            status: 404,
            description: notFound,
            schema: {
              example: {
                statusCode: 404,
                message: notFound,
                error: 'Not Found',
              },
            },
          }),
        ]
      : []),
    ...(conflict
      ? [
          ApiResponse({
            status: 409,
            description: conflict,
            schema: {
              example: {
                statusCode: 409,
                message: conflict,
                error: 'Conflict',
              },
            },
          }),
        ]
      : []),
  ];

  return applyDecorators(...decorators);
}
