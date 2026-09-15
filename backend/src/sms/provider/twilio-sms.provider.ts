import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SmsProvider, SmsSendResult } from './sms-provider.interface';

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private readonly client: Twilio;
  private readonly fromNumber: string;

  constructor(configService: ConfigService) {
    this.client = new Twilio(
      configService.get<string>('TWILIO_ACCOUNT_SID'),
      configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
    this.fromNumber = configService.get<string>('TWILIO_FROM_NUMBER') as string;
  }

  async send(to: string, message: string): Promise<SmsSendResult> {
    try {
      const result = await this.client.messages.create({
        to,
        from: this.fromNumber,
        body: message,
      });
      return { success: true, providerRef: result.sid };
    } catch (error) {
      this.logger.error(`Échec envoi SMS à ${to}`, error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}
