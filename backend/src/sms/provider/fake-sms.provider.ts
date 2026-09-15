import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SmsProvider, SmsSendResult } from './sms-provider.interface';

@Injectable()
export class FakeSmsProvider implements SmsProvider {
  private readonly logger = new Logger('SMS (simulation)');

  async send(to: string, message: string): Promise<SmsSendResult> {
    this.logger.log(`Vers ${to}: ${message}`);
    return { success: true, providerRef: `fake-${randomUUID()}` };
  }
}
