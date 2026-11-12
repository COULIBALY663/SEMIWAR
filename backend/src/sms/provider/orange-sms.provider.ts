import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider, SmsSendResult } from './sms-provider.interface';
import { normaliserTelephone } from '../../common/utils/normaliser-telephone';

const ORANGE_API = 'https://api.orange.com';

/**
 * Envoi via l'API « SMS Côte d'Ivoire » d'Orange Developer
 * (https://developer.orange.com/apis/sms-ci).
 * Authentification OAuth2 client_credentials, jeton mis en cache.
 */
@Injectable()
export class OrangeSmsProvider implements SmsProvider {
  readonly nom = 'orange';
  readonly reel = true;
  private readonly logger = new Logger(OrangeSmsProvider.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly senderAddress: string;
  private readonly senderName?: string;
  private readonly indicatifPays: string;

  private jeton?: string;
  private jetonExpireA = 0;

  constructor(configService: ConfigService) {
    this.clientId = configService.get<string>('ORANGE_CLIENT_ID') as string;
    this.clientSecret = configService.get<string>('ORANGE_CLIENT_SECRET') as string;
    this.indicatifPays = configService.get<string>('SMS_INDICATIF_PAYS', '225');
    // Adresse expéditeur imposée par Orange : "tel:+2250000" pour la Côte d'Ivoire.
    this.senderAddress = configService.get<string>(
      'ORANGE_SENDER_ADDRESS',
      `tel:+${this.indicatifPays}0000`,
    );
    // Nom d'expéditeur (ex. "SEWIMAR") : doit être validé par Orange au préalable.
    this.senderName = configService.get<string>('ORANGE_SENDER_NAME') || undefined;
  }

  static estConfigure(configService: ConfigService): boolean {
    return Boolean(
      configService.get<string>('ORANGE_CLIENT_ID') &&
        configService.get<string>('ORANGE_CLIENT_SECRET'),
    );
  }

  private async obtenirJeton(): Promise<string> {
    if (this.jeton && Date.now() < this.jetonExpireA) return this.jeton;

    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
    const res = await fetch(`${ORANGE_API}/oauth/v3/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) {
      throw new Error(
        `Authentification Orange refusée (${res.status}) : ${await res.text()}`,
      );
    }
    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.jeton = data.access_token;
    // Marge de 60 s avant l'expiration réelle.
    this.jetonExpireA = Date.now() + (Number(data.expires_in) - 60) * 1000;
    return this.jeton;
  }

  async send(to: string, message: string): Promise<SmsSendResult> {
    const destinataire = normaliserTelephone(to, this.indicatifPays);
    try {
      const jeton = await this.obtenirJeton();
      const res = await fetch(
        `${ORANGE_API}/smsmessaging/v1/outbound/${encodeURIComponent(
          this.senderAddress,
        )}/requests`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jeton}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            outboundSMSMessageRequest: {
              address: `tel:${destinataire}`,
              senderAddress: this.senderAddress,
              ...(this.senderName ? { senderName: this.senderName } : {}),
              outboundSMSTextMessage: { message },
            },
          }),
        },
      );

      if (res.status === 401) this.jeton = undefined;
      if (!res.ok) {
        throw new Error(`Orange a refusé l'envoi (${res.status}) : ${await res.text()}`);
      }

      const data = (await res.json()) as {
        outboundSMSMessageRequest?: { resourceURL?: string };
      };
      const resourceUrl = data.outboundSMSMessageRequest?.resourceURL ?? '';
      return {
        success: true,
        providerRef: resourceUrl.split('/').pop() || resourceUrl || 'orange',
        fournisseur: this.nom,
      };
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
