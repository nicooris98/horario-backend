import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';
import { UpdateSubjectStatusDto } from './dto/update-subject-status.dto';
import { FilterSubjectsDto } from './dto/filter-subjects.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Subjects')
@ApiBearerAuth()
@Controller('subjects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Permissions('subjects.create')
  @ApiOperation({
    summary: 'Crear una nueva materia',
    description:
      'Crea un nuevo espacio curricular o materia asociado a un plan de estudio y a un régimen de cursado. Valida que el año de cursado no exceda la duración del plan, que no existan materias duplicadas en el mismo plan (insensible a mayúsculas y espacios) y normaliza los docentes máximos si no se admiten múltiples docentes.',
  })
  @ApiBody({
    type: CreateAsignaturaDto,
    description: 'Datos requeridos para la creación de la materia',
    examples: {
      ejemploValido: {
        summary: 'Creación de materia válida',
        value: {
          name: 'Programación Web',
          studyPlanId: 1,
          regimeId: 1,
          year: 2,
          weeklyHours: 6,
          allowsMultipleTeachers: false,
          maxTeachers: null,
        },
      },
      ejemploConMultiplesDocentes: {
        summary: 'Creación con múltiples docentes permitidos',
        value: {
          name: 'Taller de Práctica Profesional',
          studyPlanId: 1,
          regimeId: 2,
          year: 3,
          weeklyHours: 4,
          allowsMultipleTeachers: true,
          maxTeachers: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Materia creada correctamente.',
    schema: {
      example: {
        id: 25,
        name: 'Programación Web',
        year: 2,
        weeklyHours: 6,
        allowsMultipleTeachers: false,
        maxTeachers: null,
        status: 'ACTIVO',
        studyPlan: {
          id: 1,
          name: 'Plan 2024 TDS',
          durationYears: 3,
        },
        regime: {
          id: 1,
          name: 'Cuatrimestral',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos. El año supera la duración del plan, campos obligatorios vacíos o formato erróneo.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'El año de cursado (5) no puede ser mayor a la duración del plan (3 años).',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente o inválido.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario sin permisos. Requiere el permiso subjects.create en uno de sus roles activos.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto. Ya existe una materia con ese nombre dentro del mismo plan de estudio.',
    schema: {
      example: {
        statusCode: 409,
        message:
          'Ya existe una materia con ese nombre en este plan de estudio.',
        error: 'Conflict',
      },
    },
  })
  create(@Body() createAsignaturaDto: CreateAsignaturaDto) {
    return this.subjectsService.create(createAsignaturaDto);
  }

  @Get()
  @Permissions('subjects.read')
  @ApiOperation({
    summary: 'Obtener el listado de materias',
    description:
      'Devuelve la colección completa de materias registradas junto con sus relaciones con el plan de estudio y el régimen de cursado. Permite filtrar opcionalmente por el identificador del plan de estudio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de materias obtenido correctamente.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Programación I',
          year: 1,
          weeklyHours: 6,
          allowsMultipleTeachers: false,
          maxTeachers: null,
          status: 'ACTIVO',
          studyPlan: {
            id: 1,
            name: 'Plan 2024 TDS',
            durationYears: 3,
          },
          regime: {
            id: 1,
            name: 'Cuatrimestral',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente o inválido.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario sin permisos. Requiere el permiso subjects.read en uno de sus roles activos.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al procesar la consulta.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
      },
    },
  })
  findAll(@Query() filterDto: FilterSubjectsDto) {
    return this.subjectsService.findAll(filterDto);
  }

  @Get(':id')
  @Permissions('subjects.read')
  @ApiOperation({
    summary: 'Consultar materia por ID',
    description:
      'Obtiene el detalle completo de un espacio curricular específico por su ID numérico, incluyendo las relaciones completas de su plan de estudio y su régimen.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único numérico de la materia',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Materia encontrada correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Programación I',
        year: 1,
        weeklyHours: 6,
        allowsMultipleTeachers: false,
        maxTeachers: null,
        status: 'ACTIVO',
        studyPlan: {
          id: 1,
          name: 'Plan 2024 TDS',
          durationYears: 3,
        },
        regime: {
          id: 1,
          name: 'Cuatrimestral',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente o inválido.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario sin permisos. Requiere el permiso subjects.read en uno de sus roles activos.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Materia inexistente con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Curriculum subject 9999 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id/status')
  @Permissions('subjects.update')
  @ApiOperation({
    summary: 'Cambiar estado de una materia (Activar / Desactivar)',
    description:
      'Actualiza el estado de disponibilidad académica de una materia. Acepta exclusivamente los valores ACTIVO o INACTIVO.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único numérico de la materia',
    example: 1,
  })
  @ApiBody({
    type: UpdateSubjectStatusDto,
    description: 'Nuevo estado a asignar a la materia',
    examples: {
      activar: {
        summary: 'Activar materia',
        value: {
          status: 'ACTIVO',
        },
      },
      desactivar: {
        summary: 'Desactivar materia',
        value: {
          status: 'INACTIVO',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la materia actualizado correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Programación I',
        year: 1,
        weeklyHours: 6,
        allowsMultipleTeachers: false,
        maxTeachers: null,
        status: 'INACTIVO',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Estado inválido. Solo se admiten los valores ACTIVO o INACTIVO.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'status must be one of the following values: ACTIVO, INACTIVO',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente o inválido.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario sin permisos. Requiere el permiso subjects.update en uno de sus roles activos.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Materia inexistente con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Curriculum subject 9999 not found',
        error: 'Not Found',
      },
    },
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateSubjectStatusDto,
  ) {
    return this.subjectsService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id')
  @Permissions('subjects.update')
  @ApiOperation({
    summary: 'Actualizar datos generales de una materia',
    description:
      'Modifica parcialmente los datos académicos y descriptivos de la materia (nombre, año, régimen, horas semanales, reglas de docentes, plan). Este endpoint modifica exclusivamente los datos generales. No permite modificar el estado de la materia. Para activar o desactivar se debe utilizar PATCH /subjects/:id/status.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único numérico de la materia',
    example: 1,
  })
  @ApiBody({
    type: UpdateAsignaturaDto,
    description:
      'Campos de la materia a actualizar (no incluye el campo status)',
    examples: {
      actualizacionParcial: {
        summary: 'Actualización de nombre y carga horaria',
        value: {
          name: 'Programación Web II',
          weeklyHours: 8,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Materia actualizada correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Programación Web II',
        year: 2,
        weeklyHours: 8,
        allowsMultipleTeachers: false,
        maxTeachers: null,
        status: 'ACTIVO',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos o propiedad no permitida (por ejemplo, si se envía "status" o un año superior a la duración del plan).',
    schema: {
      example: {
        statusCode: 400,
        message: ['property status should not exist'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente o inválido.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario sin permisos. Requiere el permiso subjects.update en uno de sus roles activos.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'Materia inexistente, o plan de estudio / régimen de referencia no encontrados.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Curriculum subject 9999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto por nombre duplicado dentro del mismo plan de estudio.',
    schema: {
      example: {
        statusCode: 409,
        message:
          'Ya existe una materia con ese nombre en este plan de estudio.',
        error: 'Conflict',
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsignaturaDto: UpdateAsignaturaDto,
  ) {
    return this.subjectsService.update(id, updateAsignaturaDto);
  }

  @Delete(':id')
  @Permissions('subjects.delete')
  @ApiOperation({
    summary: 'Desactivar una materia mediante baja lógica',
    description:
      'Realiza una baja lógica cambiando el estado de la materia a INACTIVO sin eliminar físicamente el registro de PostgreSQL. Esto preserva de forma íntegra las referencias existentes en cursos y divisiones.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único numérico de la materia a desactivar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Baja lógica realizada correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Programación I',
        year: 1,
        weeklyHours: 6,
        allowsMultipleTeachers: false,
        maxTeachers: null,
        status: 'INACTIVO',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente o inválido.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuario sin permisos. Requiere el permiso subjects.delete en uno de sus roles activos.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Materia inexistente con el ID proporcionado.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Curriculum subject 9999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflicto. La materia ya se encuentra inactiva previamente.',
    schema: {
      example: {
        statusCode: 409,
        message: 'La materia ya se encuentra inactiva',
        error: 'Conflict',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.remove(id);
  }
}
