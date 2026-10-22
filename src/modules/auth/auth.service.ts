import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.userService.create(registerDto);
  }

  verifyActivationCode(email: string, code: string) {
    return this.userService.verifyActivationCode(email, code);
  }

  setActivationPassword(token: string, password: string, confirmation: string) {
    return this.userService.setActivationPassword(
      token,
      password,
      confirmation,
    );
  }

  resendActivationCode(email: string) {
    return this.userService.resendActivationCode(email);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email, true);

    if (!user || !user.isActive || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      accessToken: this.signToken(user),
      user,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userService.findOneWithPermissions(userId);
    const activeRoles = (user.roles ?? []).filter((role) => role.isActive);
    const permissions = [
      ...new Set(
        activeRoles.flatMap((role) =>
          (role.permissions ?? [])
            .filter((permission) => permission.isActive)
            .map((permission) => permission.code),
        ),
      ),
    ];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: activeRoles.map(({ id, name, description, isActive }) => ({
        id,
        name,
        description,
        isActive,
      })),
      permissions,
    };
  }

  private signToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: (user.roles ?? [])
        .filter((role) => role.isActive)
        .map((role) => role.name),
    };

    return this.jwtService.sign(payload);
  }
}
