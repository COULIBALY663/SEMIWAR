import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presence } from '../entity/presence.entity';

@Injectable()
export class PresenceRepository {
  constructor(
    @InjectRepository(Presence) private readonly repo: Repository<Presence>,
  ) {}

  // matricule/dateNaissance sont les identifiants de connexion élève : on ne
  // les renvoie jamais via la relation eleve exposée aux clients.
  private static readonly SELECT_ELEVE = {
    id: true,
    nom: true,
    prenom: true,
    classeId: true,
  } as const;

  findByAppelId(appelId: string): Promise<Presence[]> {
    return this.repo.find({
      where: { appelId },
      relations: { eleve: true },
      select: { eleve: PresenceRepository.SELECT_ELEVE },
    });
  }

  findById(id: string): Promise<Presence | null> {
    return this.repo.findOne({
      where: { id },
      relations: { eleve: true, appel: true },
      select: { eleve: PresenceRepository.SELECT_ELEVE },
    });
  }

  createMany(data: Partial<Presence>[]): Promise<Presence[]> {
    const presences = this.repo.create(data);
    return this.repo.save(presences);
  }

  save(presence: Presence): Promise<Presence> {
    return this.repo.save(presence);
  }

  saveMany(presences: Presence[]): Promise<Presence[]> {
    return this.repo.save(presences);
  }

  findForStatistiques(
    eleveId: string,
    dateDebut: string,
    dateFin: string,
  ): Promise<Presence[]> {
    return this.repo
      .createQueryBuilder('presence')
      .innerJoinAndSelect('presence.appel', 'appel')
      .innerJoinAndSelect('appel.creneau', 'creneau')
      .where('presence.eleve_id = :eleveId', { eleveId })
      .andWhere('appel.date BETWEEN :dateDebut AND :dateFin', {
        dateDebut,
        dateFin,
      })
      .getMany();
  }
}
