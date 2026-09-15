import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsLog } from './entity/sms-log.entity';
import { SmsLogRepository } from './repository/sms-log.repository';
import { SmsService } from './service/sms.service';
import { SmsLogController } from './controllers/sms-log.controller';
import { SMS_PROVIDER } from './provider/sms-provider.interface';
import { TwilioSmsProvider } from './provider/twilio-sms.provider';
import { FakeSmsProvider } from './provider/fake-sms.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog]), ConfigModule],
  controllers: [SmsLogController],
  providers: [
    SmsLogRepository,
    SmsService,
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const hasTwilioCreds = Boolean(
          configService.get<string>('TWILIO_ACCOUNT_SID') &&
            configService.get<string>('TWILIO_AUTH_TOKEN') &&
            configService.get<string>('TWILIO_FROM_NUMBER'),
        );
        return hasTwilioCreds
          ? new TwilioSmsProvider(configService)
          : new FakeSmsProvider();
      },
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
