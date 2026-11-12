import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsLog } from './entity/sms-log.entity';
import { SmsLogRepository } from './repository/sms-log.repository';
import { SmsService } from './service/sms.service';
import { SmsLogController } from './controllers/sms-log.controller';
import { SMS_PROVIDER } from './provider/sms-provider.interface';
import type { SmsProvider } from './provider/sms-provider.interface';
import { TwilioSmsProvider } from './provider/twilio-sms.provider';
import { OrangeSmsProvider } from './provider/orange-sms.provider';
import { FakeSmsProvider } from './provider/fake-sms.provider';

/**
 * Choix du fournisseur via SMS_PROVIDER :
 *  - "twilio" | "orange" | "simulation" : forcé
 *  - absent / "auto" : Orange si configuré, sinon Twilio, sinon simulation
 */
function creerFournisseur(configService: ConfigService): SmsProvider {
  const logger = new Logger('SmsModule');
  const choix = (configService.get<string>('SMS_PROVIDER') || 'auto')
    .trim()
    .toLowerCase();
  const orangeOk = OrangeSmsProvider.estConfigure(configService);
  const twilioOk = TwilioSmsProvider.estConfigure(configService);

  let provider: SmsProvider;
  if (choix === 'orange') {
    if (!orangeOk) {
      throw new Error(
        'SMS_PROVIDER=orange mais ORANGE_CLIENT_ID / ORANGE_CLIENT_SECRET sont absents',
      );
    }
    provider = new OrangeSmsProvider(configService);
  } else if (choix === 'twilio') {
    if (!twilioOk) {
      throw new Error(
        'SMS_PROVIDER=twilio mais TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER sont absents',
      );
    }
    provider = new TwilioSmsProvider(configService);
  } else if (choix === 'simulation' || choix === 'fake') {
    provider = new FakeSmsProvider();
  } else if (orangeOk) {
    provider = new OrangeSmsProvider(configService);
  } else if (twilioOk) {
    provider = new TwilioSmsProvider(configService);
  } else {
    provider = new FakeSmsProvider();
  }

  if (provider.reel) {
    logger.log(`Fournisseur SMS : ${provider.nom} (envoi réel)`);
  } else {
    logger.warn(
      'Fournisseur SMS : SIMULATION — aucun SMS ne sera réellement envoyé. ' +
        'Renseignez ORANGE_CLIENT_ID/ORANGE_CLIENT_SECRET ou les variables TWILIO_*.',
    );
  }
  return provider;
}

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog]), ConfigModule],
  controllers: [SmsLogController],
  providers: [
    SmsLogRepository,
    SmsService,
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: creerFournisseur,
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
