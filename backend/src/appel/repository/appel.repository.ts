import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appel } from '../entity/appel.entity';

@Injectable()
export class AppelRepository {
  constructor(
    @InjectRepository(Appel) private readonly repo: Repository<Appel>,
  ) {}

  // matricule/dateNaissance sont les identifiants de connexion élève : on ne
  // les renvoie jamais via la liste des présences d'un appel.
  private static readonly SELECT_PRESENCES = {
    id: true,
    appelId: true,
    eleveId: true,
    statut: true,
    justification: true,
    justifieParUserId: true,
    justifieAt: true,
    eleve: { id: true, nom: true, prenom: true, classeId: true },
  } as const;

  findById(id: string): Promise<Appel | null> {
    return this.repo.findOne({
      where: { id },
      relations: { presences: { eleve: true }, classe: true, creneau: true },
      select: { presences: AppelRepository.SELECT_PRESENCES },
    });
  }

  /**
   * Lecture avec verrou optimiste : à utiliser avant toute modification
   * (marquerAbsences/valider). `version` doit être la valeur vue par le
   * client (renvoyée dans les réponses précédentes) ; si la ligne a été
   * modifiée entre-temps, TypeORM lève OptimisticLockVersionMismatchError.
   * Validé empiriquement : un simple `.save()` d'une entité périmée
   * n'offre AUCUNE protection (écrasement silencieux) — seul ce mécanisme
   * de lecture verrouillée détecte le conflit de façon fiable.
   */
  findByIdWithLock(id: string, version: number): Promise<Appel | null> {
    return this.repo.findOne({
      where: { id },
      relations: { presences: { eleve: true }, classe: true, creneau: true },
      select: { presences: AppelRepository.SELECT_PRESENCES },
      lock: { mode: 'optimistic', version },
    });
  }

  findByCreneauAndDate(creneauId: string, date: string): Promise<Appel | null> {
    return this.repo.findOne({ where: { creneauId, date } });
  }

  findByClasseId(classeId: string): Promise<Appel[]> {
    return this.repo.find({
      where: { classeId },
      order: { date: 'DESC' },
      relations: { creneau: true },
    });
  }

  create(data: Partial<Appel>): Promise<Appel> {
    const appel = this.repo.create(data);
    return this.repo.save(appel);
  }

  save(appel: Appel): Promise<Appel> {
    return this.repo.save(appel);
  }
}
