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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import type { Response } from 'express';
import { VerifyActivationCodeDto } from '../users/dto/verify-activation-code.dto';
import { ResendActivationCodeDto } from '../users/dto/resend-activation-code.dto';
import { SetActivationPasswordDto } from '../users/dto/set-activation-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('activation/verify-code')
  @HttpCode(HttpStatus.OK)
  verifyActivationCode(@Body() dto: VerifyActivationCodeDto) {
    return this.authService.verifyActivationCode(dto.email, dto.code);
  }

  @Post('activation/resend-code')
  @HttpCode(HttpStatus.OK)
  resendActivationCode(@Body() dto: ResendActivationCodeDto) {
    return this.authService.resendActivationCode(dto.email);
  }

  @Post('activation/set-password')
  @HttpCode(HttpStatus.OK)
  setActivationPassword(@Body() dto: SetActivationPasswordDto) {
    return this.authService.setActivationPassword(
      dto.token,
      dto.password,
      dto.passwordConfirmation,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.login(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
      path: '/',
    });

    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
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
  me(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
