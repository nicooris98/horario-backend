import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { BrevoEmailService } from '../../../common/email/brevo-email.service';
import { AccountActivationChallenge } from '../entities/account-activation-challenge.entity';
import { User } from '../entities/user.entity';

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const MAX_FAILED_ATTEMPTS = 5;
const PASSWORD_SETUP_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

export interface ActivationVerificationResult {
  message: string;
  requiresPassword: boolean;
  passwordSetupToken?: string;
}

interface ActivationDelivery {
  email: string;
  code: string;
}

@Injectable()
export class UserActivationService {
  private readonly logger = new Logger(UserActivationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly emailService: BrevoEmailService,
  ) {}

  async createInitialChallenge(
    manager: EntityManager,
    user: User,
  ): Promise<ActivationDelivery> {
    const code = this.generateCode();
    const now = new Date();
    const challenge = manager.create(AccountActivationChallenge, {
      userId: user.id,
      user,
      codeHash: this.hashCode(code),
      expiresAt: new Date(now.getTime() + OTP_LIFETIME_MS),
      failedAttempts: 0,
      lastSentAt: now,
      sendWindowStartedAt: now,
      sendsInWindow: 1,
      consumedAt: null,
    });
    await manager.save(AccountActivationChallenge, challenge);

    return { email: user.email, code };
  }

  async sendActivationCode(delivery: ActivationDelivery): Promise<void> {
    this.emailService.sendActivationButtonEmail(delivery.email, delivery.code);
  }

  async verifyCode(
    email: string,
    code: string,
  ): Promise<ActivationVerificationResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { email: normalizedEmail },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user || this.passwordBlocksCode(user)) {
        return { activated: false as const };
      }

      const challenge = await manager.findOne(AccountActivationChallenge, {
        where: { userId: user.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!challenge || challenge.consumedAt) {
        return { activated: false as const };
      }

      const now = new Date();
      if (challenge.expiresAt.getTime() <= now.getTime()) {
        challenge.consumedAt = now;
        await manager.save(AccountActivationChallenge, challenge);
        return { activated: false as const };
      }

      if (challenge.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        return { activated: false as const };
      }

      if (!this.matchesCode(code, challenge.codeHash)) {
        challenge.failedAttempts += 1;
        if (challenge.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          challenge.consumedAt = now;
        }
        await manager.save(AccountActivationChallenge, challenge);
        return { activated: false as const };
      }

      challenge.consumedAt = now;
      user.isActive = true;
      const passwordSetupToken =
        this.isProduction() || user.password
          ? undefined
          : randomBytes(32).toString('hex');
      challenge.passwordSetupTokenHash = passwordSetupToken
        ? this.hashCode(passwordSetupToken)
        : null;
      challenge.passwordSetupTokenExpiresAt = passwordSetupToken
        ? new Date(now.getTime() + PASSWORD_SETUP_TOKEN_LIFETIME_MS)
        : null;
      await manager.save(AccountActivationChallenge, challenge);
      await manager.save(User, user);
      return { activated: true as const, passwordSetupToken };
    });

    if (result.activated !== true) {
      throw new BadRequestException('Código inválido, vencido o ya utilizado');
    }

    return {
      message: 'Correo verificado correctamente',
      requiresPassword: Boolean(result.passwordSetupToken),
      ...(result.passwordSetupToken
        ? { passwordSetupToken: result.passwordSetupToken }
        : {}),
    };
  }

  async setPassword(
    token: string,
    password: string,
    confirmation: string,
  ): Promise<{ message: string }> {
    if (this.isProduction()) {
      throw new BadRequestException(
        'La contraseña no se utiliza en producción',
      );
    }

    if (password !== confirmation) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const tokenHash = this.hashCode(token);
    const result = await this.dataSource.transaction(async (manager) => {
      const challenge = await manager.findOne(AccountActivationChallenge, {
        where: { passwordSetupTokenHash: tokenHash },
        lock: { mode: 'pessimistic_write' },
      });
      const now = new Date();

      if (
        !challenge ||
        !challenge.passwordSetupTokenExpiresAt ||
        challenge.passwordSetupTokenExpiresAt.getTime() <= now.getTime()
      ) {
        return false;
      }

      const user = await manager.findOne(User, {
        where: { id: challenge.userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user || !user.isActive || user.password) {
        return false;
      }

      user.password = await bcrypt.hash(password, 10);
      challenge.passwordSetupTokenHash = null;
      challenge.passwordSetupTokenExpiresAt = null;
      await manager.save(User, user);
      await manager.save(AccountActivationChallenge, challenge);
      return true;
    });

    if (!result) {
      throw new BadRequestException(
        'Token de activación inválido, vencido o ya utilizado',
      );
    }

    return { message: 'Contraseña configurada correctamente' };
  }

  async resendCode(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const delivery = await this.dataSource.transaction(async (manager) => {
        const user = await manager.findOne(User, {
          where: { email: normalizedEmail },
          lock: { mode: 'pessimistic_write' },
        });
        if (!user || this.passwordBlocksCode(user)) {
          return undefined;
        }

        const now = new Date();
        const challenge = await manager.findOne(AccountActivationChallenge, {
          where: { userId: user.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!challenge) {
          return this.createInitialChallenge(manager, user);
        }

        const isWindowExpired =
          now.getTime() - challenge.sendWindowStartedAt.getTime() >=
          SEND_WINDOW_MS;
        const windowStartedAt = isWindowExpired
          ? now
          : challenge.sendWindowStartedAt;
        const sendsInWindow = isWindowExpired ? 0 : challenge.sendsInWindow;
        const isCoolingDown =
          now.getTime() - challenge.lastSentAt.getTime() < RESEND_COOLDOWN_MS;

        if (isCoolingDown || sendsInWindow >= MAX_SENDS_PER_WINDOW) {
          return undefined;
        }

        const code = this.generateCode();
        challenge.codeHash = this.hashCode(code);
        challenge.expiresAt = new Date(now.getTime() + OTP_LIFETIME_MS);
        challenge.failedAttempts = 0;
        challenge.lastSentAt = now;
        challenge.sendWindowStartedAt = windowStartedAt;
        challenge.sendsInWindow = sendsInWindow + 1;
        challenge.consumedAt = null;
        challenge.passwordSetupTokenHash = null;
        challenge.passwordSetupTokenExpiresAt = null;
        await manager.save(AccountActivationChallenge, challenge);

        return { email: user.email, code };
      });

      if (delivery) {
        await this.emailService.sendActivationCode(delivery.email, delivery.code);
      }
    } catch (error) {
      if (!(error instanceof ServiceUnavailableException)) {
        throw error;
      }
      this.logger.error('Activation resend could not be completed');
    }

    return {
      message:
        'Si la cuenta existe, se enviará un código de verificación.',
    };
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private passwordBlocksCode(user: User): boolean {
    return !this.isProduction() && Boolean(user.isActive && user.password);
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private hashCode(code: string): string {
    const secret = this.configService.get<string>('ACTIVATION_OTP_SECRET');
    if (!secret || secret.length < 32) {
      throw new ServiceUnavailableException(
        'El servicio de activación no está configurado',
      );
    }

    return createHmac('sha256', secret).update(code).digest('hex');
  }

  private matchesCode(code: string, storedHash: string): boolean {
    const suppliedHash = Buffer.from(this.hashCode(code), 'hex');
    const expectedHash = Buffer.from(storedHash, 'hex');

    return (
      suppliedHash.length === expectedHash.length &&
      timingSafeEqual(suppliedHash, expectedHash)
    );
  }
}
