import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClasseRepository } from '../repository/classe.repository';
import { CreateClasseDto } from '../dto/create-classe.dto';
import { UpdateClasseDto } from '../dto/update-classe.dto';
import { AffecterResponsableDto } from '../dto/affecter-responsable.dto';
import { EleveRepository } from '../../eleve/repository/eleve.repository';
import { AuthService } from '../../auth/service/auth.service';
import { genererMotDePasseLisible } from '../../common/utils/generer-mot-de-passe';
import { Classe } from '../entity/classe.entity';

@Injectable()
export class ClasseService {
  constructor(
    private readonly classeRepository: ClasseRepository,
    private readonly eleveRepository: EleveRepository,
    private readonly authService: AuthService,
  ) {}

  findAll(): Promise<Classe[]> {
    return this.classeRepository.findAll();
  }

  async findOneOrFail(id: string): Promise<Classe> {
    const classe = await this.classeRepository.findById(id);
    if (!classe) {
      throw new NotFoundException('Classe introuvable');
    }
    return classe;
  }

  /** Le nom d'une classe est dérivé automatiquement de son niveau et sa filière. */
  private nomAutomatique(niveau: string, filiere: string): string {
    return `${niveau} ${filiere}`;
  }

  async create(dto: CreateClasseDto): Promise<Classe> {
    const existante = await this.classeRepository.findByNiveauEtFiliere(
      dto.niveau,
      dto.filiere,
    );
    if (existante) {
      throw new BadRequestException(
        'Une classe existe déjà pour cette filière à ce niveau',
      );
    }
    const nom = this.nomAutomatique(dto.niveau, dto.filiere);
    return this.classeRepository.create(nom, dto.niveau, dto.filiere);
  }

  async update(id: string, dto: UpdateClasseDto): Promise<Classe> {
    const classe = await this.findOneOrFail(id);
    const niveau = dto.niveau ?? classe.niveau;
    const filiere = dto.filiere ?? classe.filiere;
    if (dto.niveau || dto.filiere) {
      const existante = await this.classeRepository.findByNiveauEtFiliere(
        niveau,
        filiere,
      );
      if (existante && existante.id !== id) {
        throw new BadRequestException(
          'Une classe existe déjà pour cette filière à ce niveau',
        );
      }
    }
    Object.assign(classe, dto);
    classe.nom = this.nomAutomatique(niveau, filiere);
    return this.classeRepository.save(classe);
  }

  async remove(id: string): Promise<void> {
    const classe = await this.findOneOrFail(id);
    await this.classeRepository.remove(classe);
  }

  /**
   * Affecte un élève au poste de chef ou sous-chef. Un mot de passe est
   * généré à cette occasion pour ce poste (identifiant matricule + mot de
   * passe, plus robuste que matricule+date de naissance vu les droits
   * supplémentaires du rôle) : seul l'administrateur le voit, une seule
   * fois, dans la réponse de cet appel.
   */
  async affecterResponsable(
    classeId: string,
    dto: AffecterResponsableDto,
  ): Promise<{ classe: Classe; motDePasse: string }> {
    const classe = await this.findOneOrFail(classeId);
    const eleve = await this.eleveRepository.findById(dto.eleveId);
    if (!eleve || eleve.classeId !== classeId) {
      throw new NotFoundException(
        "Cet élève n'appartient pas à cette classe",
      );
    }
    // Une classe n'a que 2 postes de responsable (chef et sous-chef) : ils
    // doivent être occupés par deux élèves distincts.
    if (dto.poste === 'CHEF') {
      if (classe.sousChefId === eleve.id) {
        throw new BadRequestException(
          'Cet élève est déjà sous-chef : il ne peut pas aussi être chef',
        );
      }
      classe.chefId = eleve.id;
    } else {
      if (classe.chefId === eleve.id) {
        throw new BadRequestException(
          'Cet élève est déjà chef : il ne peut pas aussi être sous-chef',
        );
      }
      classe.sousChefId = eleve.id;
    }
    await this.classeRepository.save(classe);

    const motDePasse = genererMotDePasseLisible();
    await this.authService.redefinirMotDePasse(eleve.userId, motDePasse);

    const classeMiseAJour = await this.findOneOrFail(classeId);
    return { classe: classeMiseAJour, motDePasse };
  }

  async estResponsable(classeId: string, eleveId: string): Promise<boolean> {
    const classe = await this.findOneOrFail(classeId);
    return classe.chefId === eleveId || classe.sousChefId === eleveId;
  }
}
