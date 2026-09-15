import { Injectable } from '@nestjs/common';
import { PresenceRepository } from '../../presence/repository/presence.repository';
import { EleveService } from '../../eleve/service/eleve.service';
import { TrimestreService } from '../../trimestre/service/trimestre.service';
import { AccesClasseService } from '../../common/acces-classe/acces-classe.service';
import { PresenceStatut } from '../../common/enums/presence-statut.enum';
import { Trimestre } from '../../trimestre/entity/trimestre.entity';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

export interface StatistiqueEleve {
  eleveId: string;
  trimestreId: string;
  heuresAbsence: number;
  heuresAbsenceJustifiee: number;
  nbAbsencesNonJustifiees: number;
}

@Injectable()
export class StatistiqueService {
  constructor(
    private readonly presenceRepository: PresenceRepository,
    private readonly eleveService: EleveService,
    private readonly trimestreService: TrimestreService,
    private readonly accesClasseService: AccesClasseService,
  ) {}

  private async resoudreTrimestre(trimestreId?: string): Promise<Trimestre> {
    return trimestreId
      ? this.trimestreService.findOneOrFail(trimestreId)
      : this.trimestreService.findEnCoursOrFail();
  }

  private async calculer(
    eleveId: string,
    trimestre: Trimestre,
  ): Promise<StatistiqueEleve> {
    const presences = await this.presenceRepository.findForStatistiques(
      eleveId,
      trimestre.dateDebut,
      trimestre.dateFin,
    );

    let heuresAbsence = 0;
    let heuresAbsenceJustifiee = 0;
    let nbAbsencesNonJustifiees = 0;

    for (const presence of presences) {
      const duree = presence.appel.creneau.dureeHeures;
      if (presence.statut === PresenceStatut.ABSENT) {
        heuresAbsence += duree;
        nbAbsencesNonJustifiees += 1;
      } else if (presence.statut === PresenceStatut.ABSENT_JUSTIFIE) {
        heuresAbsenceJustifiee += duree;
      }
    }

    return {
      eleveId,
      trimestreId: trimestre.id,
      heuresAbsence,
      heuresAbsenceJustifiee,
      nbAbsencesNonJustifiees,
    };
  }

  async pourEleve(
    user: AuthenticatedUser,
    eleveId: string,
    trimestreId?: string,
  ): Promise<StatistiqueEleve> {
    const eleve = await this.eleveService.findOneOrFail(eleveId);
    await this.accesClasseService.assertLectureAutorisee(user, eleve.classeId);
    const trimestre = await this.resoudreTrimestre(trimestreId);
    return this.calculer(eleveId, trimestre);
  }

  /**
   * Réservé aux traitements système (ex: détection des absences répétées) :
   * pas de vérification d'accès utilisateur, à ne jamais exposer via un
   * controller HTTP.
   */
  async pourEleveInterne(
    eleveId: string,
    trimestreId: string,
  ): Promise<StatistiqueEleve> {
    const trimestre = await this.resoudreTrimestre(trimestreId);
    return this.calculer(eleveId, trimestre);
  }

  async pourClasse(
    user: AuthenticatedUser,
    classeId: string,
    trimestreId?: string,
  ): Promise<StatistiqueEleve[]> {
    await this.accesClasseService.assertLectureAutorisee(user, classeId);
    const trimestre = await this.resoudreTrimestre(trimestreId);
    const eleves = await this.eleveService.findByClasse(classeId);
    return Promise.all(eleves.map((e) => this.calculer(e.id, trimestre)));
  }
}
