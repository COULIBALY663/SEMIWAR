export interface SmsSendResult {
  success: boolean;
  providerRef?: string;
  error?: string;
  /** Nom du fournisseur ayant traité l'envoi (twilio, orange, simulation). */
  fournisseur?: string;
  /** true si aucun SMS réel n'a été envoyé (mode simulation). */
  simulation?: boolean;
}

export const SMS_PROVIDER = 'SMS_PROVIDER';

export interface SmsProvider {
  /** Identifiant du fournisseur : 'twilio' | 'orange' | 'simulation'. */
  readonly nom: string;
  /** false pour le fournisseur de simulation. */
  readonly reel: boolean;
  send(to: string, message: string): Promise<SmsSendResult>;
}
