import { Inject, Injectable, Logger } from '@nestjs/common';
import { SMS_PROVIDER } from '../provider/sms-provider.interface';
import type { SmsProvider } from '../provider/sms-provider.interface';
import { SmsLogRepository } from '../repository/sms-log.repository';
import { SmsStatut } from '../../common/enums/sms-statut.enum';
import { Parent } from '../../parent/entity/parent.entity';
import { Eleve } from '../../eleve/entity/eleve.entity';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
    private readonly smsLogRepository: SmsLogRepository,
  ) {}

  async notifierAbsence(
    presenceId: string,
    eleve: Eleve,
    parent: Parent,
    date: string,
  ): Promise<void> {
    const message = `SEMIWAR: Votre enfant ${eleve.prenom} ${eleve.nom} a été noté(e) ABSENT le ${date}. Contactez l'administration pour plus d'informations.`;
    try {
      const result = await this.smsProvider.send(parent.telephone, message);
      await this.smsLogRepository.create({
        presenceId,
        parentId: parent.id,
        telephone: parent.telephone,
        message,
        statut: result.success ? SmsStatut.ENVOYE : SmsStatut.ECHEC,
        providerRef: result.providerRef ?? null,
        erreur: result.error ?? null,
      });
    } catch (error) {
      this.logger.error(
        `Erreur inattendue lors de l'envoi du SMS à ${parent.telephone}`,
        error as Error,
      );
      await this.smsLogRepository.create({
        presenceId,
        parentId: parent.id,
        telephone: parent.telephone,
        message,
        statut: SmsStatut.ECHEC,
        providerRef: null,
        erreur: (error as Error).message,
      });
    }
  }
}
