import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.userService.create(registerDto);
  }

  verifyActivationCode(email: string, code: string) {
    return this.userService.verifyActivationCode(email, code);
  }

  async createSession(email: string) {
    const user = await this.userService.findOneByEmail(email, true);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      accessToken: this.signToken(user),
      user,
    };
  }

  setActivationPassword(token: string, password: string, confirmation: string) {
    return this.userService.setActivationPassword(
      token,
      password,
      confirmation,
    );
  }

  async login(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const configuredEmail = this.configService
      .get<string>('SEED_ADMIN_EMAIL')
      ?.trim()
      .toLowerCase();

    if (
      !this.isProduction() &&
      configuredEmail &&
      normalizedEmail === configuredEmail
    ) {
      const user = await this.userService.findOneByEmail(normalizedEmail, true);

      if (user?.isActive) {
        return {
          verificationRequired: false as const,
          accessToken: this.signToken(user),
          user,
        };
      }
    }

    await this.userService.resendActivationCode(normalizedEmail);

    return { verificationRequired: true as const };
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

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
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
