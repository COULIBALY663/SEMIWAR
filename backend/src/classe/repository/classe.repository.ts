import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classe } from '../entity/classe.entity';
import { NiveauClasse } from '../../common/enums/niveau-classe.enum';

@Injectable()
export class ClasseRepository {
  constructor(
    @InjectRepository(Classe) private readonly repo: Repository<Classe>,
  ) {}

  /**
   * matricule/dateNaissance servent d'identifiants de connexion élève : on
   * ne les charge jamais dans les relations chef/sousChef exposées ici, au
   * risque de permettre l'usurpation d'un délégué de classe.
   */
  private static readonly SELECT_RESPONSABLE = {
    id: true,
    nom: true,
    prenom: true,
  } as const;

  findAll(): Promise<Classe[]> {
    return this.repo.find({
      relations: { chef: true, sousChef: true },
      select: {
        chef: ClasseRepository.SELECT_RESPONSABLE,
        sousChef: ClasseRepository.SELECT_RESPONSABLE,
      },
    });
  }

  findById(id: string): Promise<Classe | null> {
    return this.repo.findOne({
      where: { id },
      relations: { chef: true, sousChef: true },
      select: {
        chef: ClasseRepository.SELECT_RESPONSABLE,
        sousChef: ClasseRepository.SELECT_RESPONSABLE,
      },
    });
  }

  /** Comparaison insensible à la casse et aux espaces superflus. */
  findByNiveauEtFiliere(
    niveau: NiveauClasse,
    filiere: string,
  ): Promise<Classe | null> {
    return this.repo
      .createQueryBuilder('classe')
      .where('classe.niveau = :niveau', { niveau })
      .andWhere('LOWER(TRIM(classe.filiere)) = LOWER(TRIM(:filiere))', {
        filiere,
      })
      .getOne();
  }

  create(nom: string, niveau: NiveauClasse, filiere: string): Promise<Classe> {
    const classe = this.repo.create({ nom, niveau, filiere });
    return this.repo.save(classe);
  }

  save(classe: Classe): Promise<Classe> {
    return this.repo.save(classe);
  }

  async remove(classe: Classe): Promise<void> {
    await this.repo.remove(classe);
  }
}
