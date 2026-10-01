import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existUser = await this.userService.findOneByEmail(registerDto.email);

    if (existUser) {
      throw new Error('Ya existe el usuario');
    }

    const hashPassword = await bcrypt.hash(registerDto.password, 10);

    await this.userService.create({
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      email: registerDto.email,
      password: hashPassword,
    });

    return {
      ok: true,
      message: 'Usuario creado correctamente',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
    };

    return {
      token: this.jwtService.sign(jwtPayload),
    };
  }
}
