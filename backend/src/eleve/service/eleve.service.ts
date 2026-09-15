import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { EleveRepository } from '../repository/eleve.repository';
import { CreateEleveDto } from '../dto/create-eleve.dto';
import { UpdateEleveDto } from '../dto/update-eleve.dto';
import { AuthService } from '../../auth/service/auth.service';
import { Role } from '../../common/enums/role.enum';
import { Eleve } from '../entity/eleve.entity';
import { genererMotDePasseLisible } from '../../common/utils/generer-mot-de-passe';

@Injectable()
export class EleveService {
  constructor(
    private readonly eleveRepository: EleveRepository,
    private readonly authService: AuthService,
  ) {}

  findAll(): Promise<Eleve[]> {
    return this.eleveRepository.findAll();
  }

  async findOneOrFail(id: string): Promise<Eleve> {
    const eleve = await this.eleveRepository.findById(id);
    if (!eleve) {
      throw new NotFoundException('Élève introuvable');
    }
    return eleve;
  }

  findByClasse(classeId: string): Promise<Eleve[]> {
    return this.eleveRepository.findByClasseId(classeId);
  }

  async findByUserIdOrFail(userId: string): Promise<Eleve> {
    const eleve = await this.eleveRepository.findByUserId(userId);
    if (!eleve) {
      throw new NotFoundException('Aucun profil élève pour ce compte');
    }
    return eleve;
  }

  async create(dto: CreateEleveDto): Promise<Eleve> {
    const emailTechnique = `eleve-${dto.matricule.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@eleves.internal`;
    const motDePasseTechnique = randomBytes(24).toString('hex');
    const user = await this.authService.createAccount(
      emailTechnique,
      motDePasseTechnique,
      Role.ELEVE,
    );
    return this.eleveRepository.create({
      userId: user.id,
      nom: dto.nom,
      prenom: dto.prenom,
      matricule: dto.matricule,
      dateNaissance: dto.dateNaissance,
      classeId: dto.classeId,
    });
  }

  /** Connexion élève : matricule + date de naissance, sans mot de passe. */
  async login(matricule: string, dateNaissance: string) {
    const eleve = await this.eleveRepository.findByMatricule(matricule);
    if (!eleve || eleve.dateNaissance !== dateNaissance) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.authService.issueTokenForUserId(eleve.userId);
  }

  /**
   * Connexion chef/sous-chef de classe : matricule + mot de passe défini
   * par l'administrateur (identifiant plus robuste que matricule+date de
   * naissance, cohérent avec les droits supplémentaires de ce rôle).
   */
  async loginAvecMotDePasse(matricule: string, password: string) {
    const eleve = await this.eleveRepository.findByMatricule(matricule);
    if (!eleve) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.authService.loginAvecMotDePasse(eleve.userId, password);
  }

  /**
   * Réservé à l'administrateur : (re)génère un mot de passe pour un élève
   * (typiquement un chef/sous-chef de classe qui l'a oublié) et le renvoie
   * en clair une seule fois — il n'est jamais stocké ni consultable après
   * coup, seule une nouvelle réinitialisation permet de "le redonner".
   */
  async reinitialiserMotDePasse(id: string): Promise<string> {
    const eleve = await this.findOneOrFail(id);
    const motDePasse = genererMotDePasseLisible();
    await this.authService.redefinirMotDePasse(eleve.userId, motDePasse);
    return motDePasse;
  }

  async update(id: string, dto: UpdateEleveDto): Promise<Eleve> {
    const eleve = await this.findOneOrFail(id);
    Object.assign(eleve, dto);
    return this.eleveRepository.save(eleve);
  }

  async remove(id: string): Promise<void> {
    const eleve = await this.findOneOrFail(id);
    await this.eleveRepository.remove(eleve);
  }
}
