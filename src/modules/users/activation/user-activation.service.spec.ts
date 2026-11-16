import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { UserActivationService } from './user-activation.service';
import { AccountActivationChallenge } from '../entities/account-activation-challenge.entity';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
}));

const SECRET = 's'.repeat(32);
const hash = (code: string) =>
  createHmac('sha256', SECRET).update(code).digest('hex');

const pendingUser = {
  id: 1,
  email: 'ana@example.com',
  isActive: false,
  isDisabled: false,
  password: null,
  roles: [],
} as unknown as User;

const future = () => new Date(Date.now() + 60_000);
const past = () => new Date(Date.now() - 60_000);

describe('UserActivationService', () => {
  const txManager = {
    findOne: jest.fn(),
    create: jest.fn((_entity, data) => data),
    save: jest.fn(() => Promise.resolve()),
  };
  const dataSource = {
    transaction: jest.fn((cb) => cb(txManager)),
  };
  const configService = { get: jest.fn() };
  const emailService = {
    sendActivationButtonEmail: jest.fn(() => Promise.resolve()),
    sendLoginCode: jest.fn(() => Promise.resolve()),
  };
  const service = new UserActivationService(
    dataSource as unknown as DataSource,
    configService as unknown as ConfigService,
    emailService as unknown as import('../../../common/email/brevo-email.service').BrevoEmailService,
  );

  const setEnv = (nodeEnv = 'test') => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return nodeEnv;
      if (key === 'ACTIVATION_OTP_SECRET') return SECRET;
      return undefined;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setEnv();
    pendingUser.isActive = false;
    pendingUser.password = null;
    txManager.create.mockImplementation((_e, data) => data);
    txManager.save.mockResolvedValue(undefined);
  });

  describe('createInitialChallenge', () => {
    it('crea el challenge hasheado y devuelve email + código', async () => {
      const result = await service.createInitialChallenge(
        txManager as unknown as EntityManager,
        pendingUser,
      );

      expect(result.email).toBe('ana@example.com');
      expect(result.code).toMatch(/^\d{6}$/);
      expect(txManager.save).toHaveBeenCalledWith(
        AccountActivationChallenge,
        expect.objectContaining({
          userId: 1,
          codeHash: expect.stringMatching(/^[0-9a-f]{64}$/),
          failedAttempts: 0,
          sendsInWindow: 1,
        }),
      );
    });
  });

  describe('sendActivationCode', () => {
    it('envía el email de activación con el código', async () => {
      await service.sendActivationCode({
        email: 'ana@example.com',
        code: '123456',
      });

      expect(emailService.sendActivationButtonEmail).toHaveBeenCalledWith(
        'ana@example.com',
        '123456',
      );
    });
  });

  describe('verifyCode', () => {
    const challenge = (overrides = {}) => ({
      userId: 1,
      codeHash: hash('123456'),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      failedAttempts: 0,
      consumedAt: null,
      ...overrides,
    });

    const mockLookup = (user: unknown, chal: unknown) => {
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(entity === User ? user : chal),
      );
    };

    it('activa al usuario y devuelve token de contraseña fuera de producción', async () => {
      mockLookup(pendingUser, challenge());

      const result = await service.verifyCode(' ANA@example.com ', '123456');

      expect(result.requiresPassword).toBe(true);
      expect(result.passwordSetupToken).toMatch(/^[0-9a-f]{64}$/);
      expect(pendingUser.isActive).toBe(true);
      expect(txManager.save).toHaveBeenCalledWith(
        AccountActivationChallenge,
        expect.objectContaining({ consumedAt: expect.any(Date) }),
      );
      expect(txManager.save).toHaveBeenCalledWith(User, pendingUser);
    });

    it('en producción no emite token de contraseña', async () => {
      setEnv('production');
      mockLookup(pendingUser, challenge());

      const result = await service.verifyCode('ana@example.com', '123456');

      expect(result.requiresPassword).toBe(false);
      expect(result.passwordSetupToken).toBeUndefined();
    });

    it('rechaza si el usuario no existe', async () => {
      mockLookup(null, null);

      await expect(service.verifyCode('x@y.com', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza si el usuario ya tiene contraseña (no prod)', async () => {
      mockLookup({ ...pendingUser, isActive: true, password: 'hash' }, null);

      await expect(
        service.verifyCode('ana@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      // Ni siquiera busca el challenge.
      expect(txManager.findOne).toHaveBeenCalledTimes(1);
    });

    it('rechaza si no hay challenge o ya fue consumido', async () => {
      mockLookup(pendingUser, challenge({ consumedAt: new Date() }));

      await expect(
        service.verifyCode('ana@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('marca el challenge como consumido si está vencido', async () => {
      const expired = challenge({ expiresAt: past() });
      mockLookup(pendingUser, expired);

      await expect(
        service.verifyCode('ana@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(expired.consumedAt).toBeInstanceOf(Date);
      expect(txManager.save).toHaveBeenCalledWith(
        AccountActivationChallenge,
        expired,
      );
    });

    it('incrementa failedAttempts con código incorrecto', async () => {
      const chal = challenge();
      mockLookup(pendingUser, chal);

      await expect(
        service.verifyCode('ana@example.com', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(chal.failedAttempts).toBe(1);
      expect(chal.consumedAt).toBeNull();
    });

    it('al llegar a 5 intentos fallidos consume el challenge', async () => {
      const chal = challenge({ failedAttempts: 4 });
      mockLookup(pendingUser, chal);

      await expect(
        service.verifyCode('ana@example.com', '000000'),
      ).rejects.toThrow(BadRequestException);
      expect(chal.failedAttempts).toBe(5);
      expect(chal.consumedAt).toBeInstanceOf(Date);
    });

    it('rechaza directo si ya alcanzó el máximo de intentos', async () => {
      mockLookup(pendingUser, challenge({ failedAttempts: 5 }));

      await expect(
        service.verifyCode('ana@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      expect(txManager.save).not.toHaveBeenCalled();
    });
  });

  describe('setPassword', () => {
    const token = 'a'.repeat(64);
    const tokenChallenge = (overrides = {}) => ({
      userId: 1,
      passwordSetupTokenHash: hash(token),
      passwordSetupTokenExpiresAt: future(),
      ...overrides,
    });
    const mockChallengeAndUser = (chal: unknown, user: unknown) => {
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(entity === AccountActivationChallenge ? chal : user),
      );
    };

    it('rechaza en producción antes de tocar la base', async () => {
      setEnv('production');

      await expect(
        service.setPassword(token, 'password1', 'password1'),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('rechaza si las contraseñas no coinciden', async () => {
      await expect(
        service.setPassword(token, 'password1', 'password2'),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('rechaza un token inexistente o vencido', async () => {
      mockChallengeAndUser(null, null);

      await expect(
        service.setPassword(token, 'password1', 'password1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza si el token está vencido', async () => {
      mockChallengeAndUser(
        tokenChallenge({ passwordSetupTokenExpiresAt: past() }),
        null,
      );

      await expect(
        service.setPassword(token, 'password1', 'password1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('configura la contraseña y limpia el token', async () => {
      const chal = tokenChallenge();
      const user = { ...pendingUser, isActive: true, password: null };
      mockChallengeAndUser(chal, user);

      const result = await service.setPassword(token, 'password1', 'password1');

      expect(result.message).toBe('Contraseña configurada correctamente');
      expect(user.password).toBe('hashed-password');
      expect(chal.passwordSetupTokenHash).toBeNull();
      expect(chal.passwordSetupTokenExpiresAt).toBeNull();
      expect(txManager.save).toHaveBeenCalledWith(User, user);
    });

    it('rechaza si el usuario ya tiene contraseña', async () => {
      mockChallengeAndUser(tokenChallenge(), {
        ...pendingUser,
        isActive: true,
        password: 'existing',
      });

      await expect(
        service.setPassword(token, 'password1', 'password1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendCode', () => {
    it('crea un challenge inicial y envía el código si el usuario no tiene', async () => {
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(entity === User ? pendingUser : null),
      );

      const result = await service.resendCode('ana@example.com');

      expect(result.message).toContain('código de verificación');
      expect(emailService.sendLoginCode).toHaveBeenCalledWith(
        'ana@example.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('no envía nada si el usuario no existe (respuesta genérica)', async () => {
      txManager.findOne.mockResolvedValue(null);

      const result = await service.resendCode('x@y.com');

      expect(result.message).toContain('código de verificación');
      expect(emailService.sendLoginCode).not.toHaveBeenCalled();
    });

    it('no reenvía dentro del cooldown de 60 segundos', async () => {
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(
          entity === User
            ? pendingUser
            : {
                userId: 1,
                sendWindowStartedAt: new Date(Date.now() - 30_000),
                sendsInWindow: 1,
                lastSentAt: new Date(),
              },
        ),
      );

      await service.resendCode('ana@example.com');

      expect(emailService.sendLoginCode).not.toHaveBeenCalled();
    });

    it('no reenvía si ya alcanzó el máximo de envíos por ventana', async () => {
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(
          entity === User
            ? pendingUser
            : {
                userId: 1,
                sendWindowStartedAt: new Date(Date.now() - 30_000),
                sendsInWindow: 5,
                lastSentAt: new Date(Date.now() - 120_000),
              },
        ),
      );

      await service.resendCode('ana@example.com');

      expect(emailService.sendLoginCode).not.toHaveBeenCalled();
    });

    it('reenvía con código nuevo si la ventana de 1h expiró', async () => {
      const chal = {
        userId: 1,
        sendWindowStartedAt: new Date(Date.now() - 2 * 60 * 60_000),
        sendsInWindow: 5,
        lastSentAt: new Date(Date.now() - 120_000),
        codeHash: 'old',
        expiresAt: past(),
        failedAttempts: 3,
      };
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(entity === User ? pendingUser : chal),
      );

      await service.resendCode('ana@example.com');

      expect(chal.sendsInWindow).toBe(1);
      expect(chal.failedAttempts).toBe(0);
      expect(chal.codeHash).not.toBe('old');
      expect(emailService.sendLoginCode).toHaveBeenCalled();
    });

    it('traga ServiceUnavailableException del email y responde genérico', async () => {
      txManager.findOne.mockImplementation((entity) =>
        Promise.resolve(entity === User ? pendingUser : null),
      );
      emailService.sendLoginCode.mockRejectedValue(
        new ServiceUnavailableException('smtp down'),
      );

      const result = await service.resendCode('ana@example.com');

      expect(result.message).toContain('código de verificación');
    });

    it('no envía si el usuario ya activó y tiene contraseña (no prod)', async () => {
      txManager.findOne.mockResolvedValue({
        ...pendingUser,
        isActive: true,
        password: 'hash',
      });

      await service.resendCode('ana@example.com');

      expect(emailService.sendLoginCode).not.toHaveBeenCalled();
    });
  });
});
