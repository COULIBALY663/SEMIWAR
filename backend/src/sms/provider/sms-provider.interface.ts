export interface SmsSendResult {
  success: boolean;
  providerRef?: string;
  error?: string;
}

export const SMS_PROVIDER = 'SMS_PROVIDER';

export interface SmsProvider {
  send(to: string, message: string): Promise<SmsSendResult>;
}
