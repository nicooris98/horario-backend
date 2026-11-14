import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';

interface BrevoEmailPayload {
  sender: { email: string; name: string };
  to: Array<{ email: string }>;
  subject: string;
  textContent: string;
  htmlContent: string;
}

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendActivationCode(email: string, code: string): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');
    const senderName = this.configService.get<string>('BREVO_SENDER_NAME');

    if (
      !apiKey ||
      !senderEmail ||
      !isEmail(senderEmail) ||
      !senderName?.trim()
    ) {
      this.logger.error('Brevo email configuration is incomplete or invalid');
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }

    const activationUrl = this.getActivationUrl(email, code);
    const linkText = activationUrl
      ? `\n\nActiva tu cuenta: ${activationUrl}`
      : '';
    const linkHtml = activationUrl
      ? `<p><a href="${this.escapeHtml(activationUrl)}">Activar cuenta</a></p>`
      : '';
    const payload: BrevoEmailPayload = {
      sender: { email: senderEmail, name: senderName.trim() },
      to: [{ email }],
      subject: 'Código para activar tu cuenta',
      textContent: `Tu código de activación es ${code}. Vence en 10 minutos.${linkText}`,
      htmlContent: `<p>Tu código de activación es:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>Vence en 10 minutos.</p>${linkHtml}`,
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        this.logger.error(
          `Brevo rejected activation email with HTTP ${response.status}`,
        );
        throw new ServiceUnavailableException(
          'No se pudo enviar el correo de activación',
        );
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error('Brevo activation email request failed');
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }
  }

  private getActivationUrl(email: string, code: string): string | undefined {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')?.trim();
    if (!frontendUrl) {
      return undefined;
    }

    let url: URL;
    try {
      url = new URL('/activate-account', frontendUrl);
    } catch {
      this.logger.error('FRONTEND_URL is invalid; activation link omitted');
      return undefined;
    }

    url.searchParams.set('email', email);
    url.searchParams.set('code', code);
    return url.toString();
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[character];
    });
  }
}
