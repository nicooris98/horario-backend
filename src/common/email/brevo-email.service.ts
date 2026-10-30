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
    if (!activationUrl) {
      this.logger.error(
        'FRONTEND_URL is missing or invalid; cannot send activation link',
      );
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }

    const safeUrl = this.escapeHtml(activationUrl);

    const payload: BrevoEmailPayload = {
      sender: { email: senderEmail, name: senderName.trim() },
      to: [{ email }],
      subject: 'Activá tu cuenta — Gestión de Horarios',
      textContent: `¡Hola!

Gracias por registrarte en nuestro sistema de gestión de horarios.

Para completar tu registro y comenzar a utilizar la plataforma, activá tu cuenta con este enlace (vence en 10 minutos):
${activationUrl}
`,
      htmlContent: this.buildActivationHtml(safeUrl),
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


  /** Mail de activación (botón/link). Remitente: BREVO_ACTIVATION_SENDER_*. No usar para OTP login. */
  async sendAccountActivationEmail(email: string, code: string): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>(
      'BREVO_ACTIVATION_SENDER_EMAIL',
    );
    const senderName = this.configService.get<string>(
      'BREVO_ACTIVATION_SENDER_NAME',
    );
    
    if (
      !apiKey ||
      !senderEmail ||
      !isEmail(senderEmail) ||
      !senderName?.trim()
    ) {
      this.logger.error(
        'Brevo activation sender configuration is incomplete or invalid',
      );
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }

    const activationUrl = this.getActivationUrl(email, code);
    if (!activationUrl) {
      this.logger.error(
        'FRONTEND_URL is missing or invalid; cannot send activation link',
      );
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }

    const safeUrl = this.escapeHtml(activationUrl);

    const payload: BrevoEmailPayload = {
      sender: { email: senderEmail, name: senderName.trim() },
      to: [{ email }],
      subject: 'Activá tu cuenta — Gestión de Horarios',
      textContent: `¡Hola!

Gracias por registrarte en nuestro sistema de gestión de horarios.

Para completar tu registro y comenzar a utilizar la plataforma, activá tu cuenta con este enlace (vence en 10 minutos):
${activationUrl}
`,
      htmlContent: this.buildActivationHtml(safeUrl),
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
  
  
  /** Mail de activación aparte: (BREVO_SENDER_*), solo botón/link. */
  async sendActivationButtonEmail(email: string, code: string): Promise<void> {
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
    if (!activationUrl) {
      this.logger.error(
        'FRONTEND_URL is missing or invalid; cannot send activation link',
      );
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }

    const safeUrl = this.escapeHtml(activationUrl);

    const payload: BrevoEmailPayload = {
      sender: { email: senderEmail, name: senderName.trim() },
      to: [{ email }],
      subject: 'Activá tu cuenta — Gestión de Horarios',
      textContent: `¡Hola!

Para activar tu cuenta usá este enlace (vence en 10 minutos):
${activationUrl}
`,
      htmlContent: this.buildActivationHtml(safeUrl),
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
          `Brevo rejected activation button email with HTTP ${response.status}`,
        );
        throw new ServiceUnavailableException(
          'No se pudo enviar el correo de activación',
        );
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error('Brevo activation button email request failed');
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de activación',
      );
    }
  }
  
  
  

  private buildActivationHtml(safeActivationUrl: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Activación de cuenta</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;border-radius:16px;overflow:hidden;background-color:#1e293b;">
          <tr>
            <td align="center" style="background-color:#2563eb;padding:28px 24px;">
              <h1 style="margin:0 0 4px;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">Gestión de Horarios</h1>
              <p style="margin:0;font-size:14px;color:#bfdbfe;">Activación de cuenta</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 28px;color:#e2e8f0;">
              <div style="text-align:center;margin-bottom:18px;">
                <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background-color:#1e3a5f;line-height:56px;font-size:26px;">✉️</div>
              </div>
              <h2 style="margin:0 0 16px;text-align:center;font-size:20px;line-height:1.35;color:#f8fafc;font-weight:700;">¡Tu cuenta está casi lista!</h2>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#cbd5e1;">¡Hola!</p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#cbd5e1;">Gracias por registrarte en nuestro sistema de gestión de horarios.</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.55;color:#cbd5e1;">Para completar tu registro y comenzar a utilizar la plataforma, solo necesitás activar tu cuenta haciendo clic en el siguiente botón.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#2563eb;">
                    <a href="${safeActivationUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">Activar mi cuenta</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;text-align:center;font-size:13px;line-height:1.5;color:#94a3b8;">Por motivos de seguridad, este enlace estará disponible durante <strong style="color:#e2e8f0;">10 minutos</strong>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
