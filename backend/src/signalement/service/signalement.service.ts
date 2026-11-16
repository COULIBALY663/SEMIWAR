import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SignalementRepository } from '../repository/signalement.repository';
import { ClasseService } from '../../classe/service/classe.service';
import { EleveService } from '../../eleve/service/eleve.service';
import { StatistiqueService } from '../../statistique/service/statistique.service';
import { TrimestreService } from '../../trimestre/service/trimestre.service';
import { SignalementStatut } from '../../common/enums/signalement-statut.enum';

@Injectable()
export class SignalementService {
  private readonly logger = new Logger(SignalementService.name);

  constructor(
    private readonly signalementRepository: SignalementRepository,
    private readonly classeService: ClasseService,
    private readonly eleveService: EleveService,
    private readonly statistiqueService: StatistiqueService,
    private readonly trimestreService: TrimestreService,
    private readonly configService: ConfigService,
  ) {}

  findAll() {
    return this.signalementRepository.findAll();
  }

  async traiter(id: string) {
    const signalement = await this.signalementRepository.findById(id);
    if (!signalement) {
      throw new NotFoundException('Signalement introuvable');
    }
    signalement.statut = SignalementStatut.TRAITE;
    return this.signalementRepository.save(signalement);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async detecterAbsencesRepetees(): Promise<void> {
    const classes = await this.classeService.findAll();
    const eleveIds: string[] = [];
    for (const classe of classes) {
      const eleves = await this.eleveService.findByClasse(classe.id);
      eleveIds.push(...eleves.map((e) => e.id));
    }
    await this.verifierEleves(eleveIds);
  }

  /**
   * Vérifie le seuil d'absences non justifiées pour les élèves donnés et
   * crée / met à jour leur signalement. Appelé par le cron nocturne et
   * juste après la validation d'un appel.
   */
  async verifierEleves(eleveIds: string[]): Promise<void> {
    if (eleveIds.length === 0) {
      return;
    }
    let trimestre;
    try {
      trimestre = await this.trimestreService.findEnCoursOrFail();
    } catch {
      this.logger.warn('Aucun trimestre en cours, détection ignorée');
      return;
    }

    const seuil = Number(
      this.configService.get<string>('SEUIL_ABSENCES_SIGNALEMENT') ?? '4',
    );

    for (const eleveId of new Set(eleveIds)) {
      const stats = await this.statistiqueService.pourEleveInterne(
        eleveId,
        trimestre.id,
      );
      if (stats.nbAbsencesNonJustifiees < seuil) {
        continue;
      }
      const existant = await this.signalementRepository.findActif(
        eleveId,
        trimestre.id,
      );
      if (existant) {
        existant.nbAbsencesNonJustifiees = stats.nbAbsencesNonJustifiees;
        await this.signalementRepository.save(existant);
        continue;
      }
      await this.signalementRepository.create({
        eleveId,
        trimestreId: trimestre.id,
        nbAbsencesNonJustifiees: stats.nbAbsencesNonJustifiees,
      });
      this.logger.log(
        `Signalement créé pour l'élève ${eleveId} (${stats.nbAbsencesNonJustifiees} absences non justifiées)`,
      );
    }
  }
}
