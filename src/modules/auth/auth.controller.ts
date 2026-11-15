import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import type { Response } from 'express';
import { VerifyActivationCodeDto } from '../users/dto/verify-activation-code.dto';
import { SetActivationPasswordDto } from '../users/dto/set-activation-password.dto';
import { ApiSuccess } from '../../common/swagger/api-docs';

const TOO_MANY_REQUESTS = {
  status: 429,
  description:
    'Demasiadas solicitudes. Los endpoints de autenticación tienen rate limit estricto para prevenir fuerza bruta.',
  schema: {
    example: {
      statusCode: 429,
      message: 'ThrottlerException: Too Many Requests',
    },
  },
} as const;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea una cuenta de usuario pendiente de activación. Se envía un código de verificación al email registrado. Rate limit: 10 solicitudes por minuto.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      valido: {
        summary: 'Registro válido',
        value: {
          first_name: 'Ana',
          last_name: 'Pérez',
          email: 'ana.perez@example.com',
          password: 'secreto123',
        },
      },
    },
  })
  @ApiSuccess(201, 'Usuario registrado correctamente. Revise su email para activar la cuenta.')
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos: campos faltantes o email/password con formato incorrecto.',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse(TOO_MANY_REQUESTS)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('activation/verify-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verificar código de activación',
    description:
      'Valida el código de 6 dígitos enviado por email. Si es correcto, activa la cuenta, establece la cookie httpOnly access_token con el JWT (válida 8 horas) y devuelve un token de configuración de contraseña junto con el usuario. Rate limit: 5 solicitudes por minuto.',
  })
  @ApiBody({
    type: VerifyActivationCodeDto,
    examples: {
      valido: {
        summary: 'Verificación válida',
        value: { email: 'ana.perez@example.com', code: '123456' },
      },
    },
  })
  @ApiSuccess(200, 'Código verificado correctamente. La cuenta queda activada, se establece la cookie access_token y se devuelve un token para configurar la contraseña (si aún no tiene una).', {
    message: 'Correo verificado correctamente',
    requiresPassword: true,
    passwordSetupToken: 'token-de-configuracion',
    user: { id: 2, firstName: 'Ana', lastName: 'Pérez', email: 'ana.perez@example.com' },
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido, vencido, ya utilizado o con intentos agotados.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Código inválido, vencido o ya utilizado',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse(TOO_MANY_REQUESTS)
  async verifyActivationCode(
    @Body() dto: VerifyActivationCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const verification = await this.authService.verifyActivationCode(
      dto.email,
      dto.code,
    );
    const { accessToken, user } = await this.authService.createSession(
      dto.email,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
      path: '/',
    });

    return { ...verification, user };
  }

  @Post('activation/set-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Definir contraseña de activación',
    description:
      'Establece la contraseña definitiva del usuario utilizando el token de configuración obtenido al verificar el código. Rate limit: 10 solicitudes por minuto.',
  })
  @ApiBody({
    type: SetActivationPasswordDto,
    examples: {
      valido: {
        summary: 'Contraseña válida',
        value: {
          token: 'token-de-configuracion',
          password: 'secreto123',
          passwordConfirmation: 'secreto123',
        },
      },
    },
  })
  @ApiSuccess(200, 'Contraseña configurada correctamente.')
  @ApiResponse({
    status: 400,
    description:
      'Token inválido o expirado, o las contraseñas no coinciden / no cumplen la política.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Las contraseñas no coinciden',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse(TOO_MANY_REQUESTS)
  setActivationPassword(@Body() dto: SetActivationPasswordDto) {
    return this.authService.setActivationPassword(
      dto.token,
      dto.password,
      dto.passwordConfirmation,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario por email. Si la cuenta requiere verificación adicional devuelve verificationRequired: true; en caso contrario establece la cookie httpOnly access_token con el JWT (válida 8 horas) y devuelve los datos del usuario. Rate limit: 5 solicitudes por minuto.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      valido: {
        summary: 'Login válido',
        value: { email: 'ana.perez@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Inicio de sesión procesado. Si verificationRequired es false, la cookie access_token queda establecida; si es true, se requiere verificación adicional por email y no se establece cookie.',
    schema: {
      oneOf: [
        {
          example: {
            verificationRequired: false,
            user: { id: 2, firstName: 'Ana', lastName: 'Pérez', email: 'ana.perez@example.com' },
          },
        },
        {
          example: { verificationRequired: true },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email con formato incorrecto.',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse(TOO_MANY_REQUESTS)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto.email);

    if (result.verificationRequired) {
      return { verificationRequired: true };
    }

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
      path: '/',
    });

    return { verificationRequired: false, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Elimina la cookie access_token del cliente, cerrando la sesión actual.',
  })
  @ApiSuccess(200, 'Sesión cerrada correctamente.', {
    message: 'Sesión cerrada correctamente',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Consultar perfil del usuario autenticado',
    description:
      'Devuelve el perfil completo del usuario autenticado (datos personales y roles). Requiere la cookie access_token.',
  })
  @ApiSuccess(200, 'Perfil obtenido correctamente.', {
    id: 2,
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana.perez@example.com',
    isActive: true,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
    roles: [{ id: 2, name: 'docente', description: null, isActive: true }],
    permissions: ['teachers.read'],
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado. Token JWT ausente, inválido o expirado.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  me(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
