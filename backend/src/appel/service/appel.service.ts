import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import { AppelRepository } from '../repository/appel.repository';
import { PresenceRepository } from '../../presence/repository/presence.repository';
import { DemarrerAppelDto } from '../dto/demarrer-appel.dto';
import { MarquerAbsencesDto } from '../dto/marquer-absences.dto';
import { ValiderAppelDto } from '../dto/valider-appel.dto';
import { EleveService } from '../../eleve/service/eleve.service';
import { ClasseService } from '../../classe/service/classe.service';
import { CreneauService } from '../../creneau/service/creneau.service';
import { ParentRepository } from '../../parent/repository/parent.repository';
import { SmsService } from '../../sms/service/sms.service';
import { AccesClasseService } from '../../common/acces-classe/acces-classe.service';
import { AppelStatut } from '../../common/enums/appel-statut.enum';
import { PresenceStatut } from '../../common/enums/presence-statut.enum';
import { Appel } from '../entity/appel.entity';
import { Presence } from '../../presence/entity/presence.entity';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

const DUREE_VERROU_MINUTES = 10;

@Injectable()
export class AppelService {
  constructor(
    private readonly appelRepository: AppelRepository,
    private readonly presenceRepository: PresenceRepository,
    private readonly eleveService: EleveService,
    private readonly classeService: ClasseService,
    private readonly creneauService: CreneauService,
    private readonly parentRepository: ParentRepository,
    private readonly smsService: SmsService,
    private readonly accesClasseService: AccesClasseService,
  ) {}

  async findOneOrFail(id: string): Promise<Appel> {
    const appel = await this.appelRepository.findById(id);
    if (!appel) {
      throw new NotFoundException('Appel introuvable');
    }
    return appel;
  }

  findByClasse(classeId: string) {
    return this.appelRepository.findByClasseId(classeId);
  }

  async findByClasseForUser(user: AuthenticatedUser, classeId: string) {
    await this.accesClasseService.assertLectureAutorisee(user, classeId);
    return this.findByClasse(classeId);
  }

  async findOneForUser(user: AuthenticatedUser, id: string): Promise<Appel> {
    const appel = await this.findOneOrFail(id);
    await this.accesClasseService.assertLectureAutorisee(user, appel.classeId);
    return appel;
  }

  private async verifierResponsable(userId: string, classeId: string) {
    const eleve = await this.eleveService.findByUserIdOrFail(userId);
    const estResponsable = await this.classeService.estResponsable(
      classeId,
      eleve.id,
    );
    if (!estResponsable) {
      throw new ForbiddenException(
        "Vous n'êtes ni le chef ni le sous-chef de cette classe",
      );
    }
    return eleve;
  }

  private estVerrouille(appel: Appel): boolean {
    if (appel.statut !== AppelStatut.VALIDE || !appel.lockedAt) {
      return false;
    }
    return new Date() > new Date(appel.lockedAt);
  }

  /**
   * Charge l'appel avec verrou optimiste : si `version` (envoyée par le
   * client) ne correspond plus à la version courante en base, l'appel a
   * été modifié entre-temps par quelqu'un d'autre (autre délégué, autre
   * onglet...) et on refuse la modification plutôt que de l'écraser.
   */
  private async findAppelAvecVerrou(
    appelId: string,
    version: number,
  ): Promise<Appel> {
    let appel: Appel | null;
    try {
      appel = await this.appelRepository.findByIdWithLock(appelId, version);
    } catch (error) {
      if (error instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException(
          "Cet appel a été modifié entre-temps, veuillez le recharger avant de réessayer",
        );
      }
      throw error;
    }
    if (!appel) {
      throw new NotFoundException('Appel introuvable');
    }
    return appel;
  }

  async demarrer(userId: string, dto: DemarrerAppelDto): Promise<Appel> {
    const creneau = await this.creneauService.findOneOrFail(dto.creneauId);
    const eleve = await this.verifierResponsable(userId, creneau.classeId);

    const existant = await this.appelRepository.findByCreneauAndDate(
      dto.creneauId,
      dto.date,
    );
    if (existant) {
      throw new BadRequestException(
        'Un appel existe déjà pour ce créneau à cette date',
      );
    }

    const appel = await this.appelRepository.create({
      creneauId: dto.creneauId,
      classeId: creneau.classeId,
      date: dto.date,
      effectueParEleveId: eleve.id,
      statut: AppelStatut.EN_COURS,
    });

    const eleves = await this.eleveService.findByClasse(creneau.classeId);
    await this.presenceRepository.createMany(
      eleves.map((e) => ({
        appelId: appel.id,
        eleveId: e.id,
        statut: PresenceStatut.PRESENT,
      })),
    );

    return this.findOneOrFail(appel.id);
  }

  async marquerAbsences(
    userId: string,
    appelId: string,
    dto: MarquerAbsencesDto,
  ): Promise<Appel> {
    const appel = await this.findAppelAvecVerrou(appelId, dto.version);
    await this.verifierResponsable(userId, appel.classeId);

    if (this.estVerrouille(appel)) {
      throw new ForbiddenException(
        "Le délai de modification de 10 minutes après validation est écoulé",
      );
    }

    // Pendant la fenêtre de grâce (appel déjà validé), un élève ajouté aux
    // absents n'a pas encore été notifié à ses parents lors de valider() :
    // il faut le faire ici, sans redoubler les élèves déjà notifiés.
    const notifierNouveauxAbsents = appel.statut === AppelStatut.VALIDE;
    const absentsIds = new Set(dto.eleveIdsAbsents);
    const presencesAMettreAJour = appel.presences.filter(
      (p) => p.statut !== PresenceStatut.ABSENT_JUSTIFIE,
    );
    const nouveauxAbsents: Presence[] = [];
    for (const presence of presencesAMettreAJour) {
      const etaitAbsent = presence.statut === PresenceStatut.ABSENT;
      const estAbsent = absentsIds.has(presence.eleveId);
      presence.statut = estAbsent
        ? PresenceStatut.ABSENT
        : PresenceStatut.PRESENT;
      if (notifierNouveauxAbsents && estAbsent && !etaitAbsent) {
        nouveauxAbsents.push(presence);
      }
    }
    await this.presenceRepository.saveMany(presencesAMettreAJour);

    // Fait avancer appel.version malgré l'absence de changement scalaire
    // direct sur l'entité (voir commentaire sur le champ), pour que le
    // verrou optimiste détecte bien les appels concurrents à
    // marquerAbsences() sur le même appel.
    appel.derniereModificationAt = new Date();
    await this.appelRepository.save(appel);

    if (nouveauxAbsents.length > 0) {
      void this.notifierParents(nouveauxAbsents, appel.date);
    }

    return this.findOneOrFail(appelId);
  }

  async valider(
    userId: string,
    appelId: string,
    dto: ValiderAppelDto,
  ): Promise<Appel> {
    const appel = await this.findAppelAvecVerrou(appelId, dto.version);
    await this.verifierResponsable(userId, appel.classeId);

    if (appel.statut === AppelStatut.VALIDE) {
      throw new BadRequestException('Cet appel a déjà été validé');
    }

    const maintenant = new Date();
    appel.statut = AppelStatut.VALIDE;
    appel.validatedAt = maintenant;
    appel.lockedAt = new Date(
      maintenant.getTime() + DUREE_VERROU_MINUTES * 60_000,
    );
    appel.positionLat = dto.positionLat;
    appel.positionLng = dto.positionLng;
    appel.positionPrecision = dto.positionPrecision;
    await this.appelRepository.save(appel);

    const absents = appel.presences.filter(
      (p) => p.statut === PresenceStatut.ABSENT,
    );
    void this.notifierParents(absents, appel.date);

    return this.findOneOrFail(appelId);
  }

  private async notifierParents(
    presences: Presence[],
    date: string,
  ): Promise<void> {
    for (const presence of presences) {
      const parents = await this.parentRepository.findParentsByEleveId(
        presence.eleveId,
      );
      for (const parent of parents) {
        await this.smsService.notifierAbsence(
          presence.id,
          presence.eleve,
          parent,
          date,
        );
      }
    }
  }
}
