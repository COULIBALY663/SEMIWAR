import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SmsProvider, SmsSendResult } from './sms-provider.interface';
import { normaliserTelephone } from '../../common/utils/normaliser-telephone';

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  readonly nom = 'twilio';
  readonly reel = true;
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private readonly client: Twilio;
  private readonly fromNumber?: string;
  private readonly messagingServiceSid?: string;
  private readonly indicatifPays: string;

  constructor(configService: ConfigService) {
    this.client = new Twilio(
      configService.get<string>('TWILIO_ACCOUNT_SID'),
      configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
    // Numéro Twilio (+1...) ou identifiant alphanumérique (ex. "SEWIMAR").
    this.fromNumber = configService.get<string>('TWILIO_FROM_NUMBER') || undefined;
    this.messagingServiceSid =
      configService.get<string>('TWILIO_MESSAGING_SERVICE_SID') || undefined;
    this.indicatifPays = configService.get<string>('SMS_INDICATIF_PAYS', '225');
  }

  static estConfigure(configService: ConfigService): boolean {
    return Boolean(
      configService.get<string>('TWILIO_ACCOUNT_SID') &&
        configService.get<string>('TWILIO_AUTH_TOKEN') &&
        (configService.get<string>('TWILIO_FROM_NUMBER') ||
          configService.get<string>('TWILIO_MESSAGING_SERVICE_SID')),
    );
  }

  async send(to: string, message: string): Promise<SmsSendResult> {
    const destinataire = normaliserTelephone(to, this.indicatifPays);
    try {
      const result = await this.client.messages.create({
        to: destinataire,
        body: message,
        ...(this.messagingServiceSid
          ? { messagingServiceSid: this.messagingServiceSid }
          : { from: this.fromNumber }),
      });
      return { success: true, providerRef: result.sid, fournisseur: this.nom };
    } catch (error) {
      this.logger.error(`Échec envoi SMS à ${destinataire}`, error as Error);
      return {
        success: false,
        error: (error as Error).message,
        fournisseur: this.nom,
      };
    }
  }
}
