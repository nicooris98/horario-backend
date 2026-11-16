import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

const user = {
  id: 1,
  firstName: 'Ana',
  lastName: 'Gómez',
  email: 'ana@example.com',
  isActive: true,
  isDisabled: false,
  roles: [{ id: 1, name: 'ADMIN', isActive: true }],
} as unknown as User;

describe('AuthService', () => {
  const userService = {
    create: jest.fn(),
    verifyActivationCode: jest.fn(),
    findOneByEmail: jest.fn(),
    setActivationPassword: jest.fn(),
    resendActivationCode: jest.fn(),
    findOneWithPermissions: jest.fn(),
  };
  const jwtService = { sign: jest.fn(() => 'signed-token') };
  const configService = { get: jest.fn() };
  const service = new AuthService(
    userService as unknown as UsersService,
    jwtService as unknown as JwtService,
    configService as unknown as ConfigService,
  );

  beforeEach(() => jest.clearAllMocks());

  describe('delegación a UsersService', () => {
    it('register delega en userService.create', async () => {
      const dto = { email: 'a@b.com' } as RegisterDto;
      userService.create.mockResolvedValue(user);

      await expect(service.register(dto)).resolves.toBe(user);
      expect(userService.create).toHaveBeenCalledWith(dto);
    });

    it('verifyActivationCode delega en userService', async () => {
      userService.verifyActivationCode.mockResolvedValue({ message: 'ok' });

      await service.verifyActivationCode('a@b.com', '123456');

      expect(userService.verifyActivationCode).toHaveBeenCalledWith(
        'a@b.com',
        '123456',
      );
    });

    it('setActivationPassword delega en userService', async () => {
      userService.setActivationPassword.mockResolvedValue({ message: 'ok' });

      await service.setActivationPassword('token', 'pass', 'pass');

      expect(userService.setActivationPassword).toHaveBeenCalledWith(
        'token',
        'pass',
        'pass',
      );
    });
  });

  describe('createSession', () => {
    it('devuelve token y usuario si la cuenta está activa', async () => {
      userService.findOneByEmail.mockResolvedValue(user);

      const result = await service.createSession('ana@example.com');

      expect(result.accessToken).toBe('signed-token');
      expect(result.user).toBe(user);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'ana@example.com',
        roles: ['ADMIN'],
      });
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(service.createSession('x@y.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException si el usuario está inactivo', async () => {
      userService.findOneByEmail.mockResolvedValue({
        ...user,
        isActive: false,
      });

      await expect(service.createSession('ana@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el usuario está deshabilitado', async () => {
      userService.findOneByEmail.mockResolvedValue({
        ...user,
        isDisabled: true,
      });

      await expect(service.createSession('ana@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('excluye roles inactivos del payload del token', async () => {
      userService.findOneByEmail.mockResolvedValue({
        ...user,
        roles: [
          { id: 1, name: 'ADMIN', isActive: true },
          { id: 2, name: 'DOCENTE', isActive: false },
        ],
      });

      await service.createSession('ana@example.com');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ roles: ['ADMIN'] }),
      );
    });
  });

  describe('login', () => {
    const configured = (env: string | undefined, email?: string) => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return env;
        if (key === 'SEED_ADMIN_EMAIL') return email;
        return undefined;
      });
    };

    it('fuera de producción, el email semilla con cuenta activa recibe token directo', async () => {
      configured('development', 'Admin@Example.com');
      userService.findOneByEmail.mockResolvedValue(user);

      const result = await service.login('  ADMIN@example.com  ');

      expect(result).toMatchObject({
        verificationRequired: false,
        accessToken: 'signed-token',
      });
      expect(userService.resendActivationCode).not.toHaveBeenCalled();
    });

    it('en producción no aplica el atajo del email semilla', async () => {
      configured('production', 'admin@example.com');
      userService.findOneByEmail.mockResolvedValue(user);

      const result = await service.login('admin@example.com');

      expect(result).toEqual({ verificationRequired: true });
      expect(userService.resendActivationCode).toHaveBeenCalledWith(
        'admin@example.com',
      );
    });

    it('si el usuario semilla no está activo, cae al flujo de código', async () => {
      configured('development', 'admin@example.com');
      userService.findOneByEmail.mockResolvedValue({
        ...user,
        isActive: false,
      });

      const result = await service.login('admin@example.com');

      expect(result).toEqual({ verificationRequired: true });
      expect(userService.resendActivationCode).toHaveBeenCalled();
    });

    it('un email común siempre pide código de verificación', async () => {
      configured('development', 'admin@example.com');

      const result = await service.login('Otro@Example.com');

      expect(result).toEqual({ verificationRequired: true });
      expect(userService.resendActivationCode).toHaveBeenCalledWith(
        'otro@example.com',
      );
    });
  });

  describe('getProfile', () => {
    it('devuelve perfil con roles activos y permisos únicos', async () => {
      userService.findOneWithPermissions.mockResolvedValue({
        ...user,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        roles: [
          {
            id: 1,
            name: 'ADMIN',
            description: 'Administrador',
            isActive: true,
            permissions: [
              { isActive: true, code: 'users.read' },
              { isActive: false, code: 'users.delete' },
              { isActive: true, code: 'users.read' },
            ],
          },
          {
            id: 2,
            name: 'DOCENTE',
            description: 'Docente',
            isActive: false,
            permissions: [{ isActive: true, code: 'schedules.read' }],
          },
        ],
      });

      const profile = await service.getProfile(1);

      expect(profile.roles).toEqual([
        { id: 1, name: 'ADMIN', description: 'Administrador', isActive: true },
      ]);
      expect(profile.permissions).toEqual(['users.read']);
      expect(profile).not.toHaveProperty('password');
      expect(userService.findOneWithPermissions).toHaveBeenCalledWith(1);
    });
  });
});
