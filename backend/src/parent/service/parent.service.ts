import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ParentRepository } from '../repository/parent.repository';
import { CreateParentDto } from '../dto/create-parent.dto';
import { InscrireEleveDto } from '../dto/inscrire-eleve.dto';
import { AuthService } from '../../auth/service/auth.service';
import { EleveService } from '../../eleve/service/eleve.service';
import { Role } from '../../common/enums/role.enum';
import { Parent } from '../entity/parent.entity';
import { Eleve } from '../../eleve/entity/eleve.entity';

@Injectable()
export class ParentService {
  constructor(
    private readonly parentRepository: ParentRepository,
    private readonly authService: AuthService,
    private readonly eleveService: EleveService,
  ) {}

  findAll(): Promise<Parent[]> {
    return this.parentRepository.findAll();
  }

  async findOneOrFail(id: string): Promise<Parent> {
    const parent = await this.parentRepository.findById(id);
    if (!parent) {
      throw new NotFoundException('Parent introuvable');
    }
    return parent;
  }

  async findByUserIdOrFail(userId: string): Promise<Parent> {
    const parent = await this.parentRepository.findByUserId(userId);
    if (!parent) {
      throw new NotFoundException('Aucun profil parent pour ce compte');
    }
    return parent;
  }

  async create(dto: CreateParentDto): Promise<Parent> {
    const emailTechnique = `parent-${dto.telephone.replace(/[^a-z0-9]+/gi, '-')}@parents.internal`;
    const motDePasseTechnique = randomBytes(24).toString('hex');
    const user = await this.authService.createAccount(
      emailTechnique,
      motDePasseTechnique,
      Role.PARENT,
    );
    return this.parentRepository.create({
      userId: user.id,
      nom: dto.nom,
      prenom: dto.prenom,
      telephone: dto.telephone,
    });
  }

  /** Connexion parent : téléphone + nom de famille, sans mot de passe. */
  async login(telephone: string, nom: string) {
    const parent = await this.parentRepository.findByTelephone(telephone);
    if (!parent || parent.nom.trim().toLowerCase() !== nom.trim().toLowerCase()) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.authService.issueTokenForUserId(parent.userId);
  }

  async lierEnfant(parentId: string, eleveId: string) {
    await this.findOneOrFail(parentId);
    await this.eleveService.findOneOrFail(eleveId);
    const dejaLie = await this.parentRepository.lienExiste(parentId, eleveId);
    if (dejaLie) {
      throw new BadRequestException('Cet élève est déjà lié à ce parent');
    }
    return this.parentRepository.lierEnfant(parentId, eleveId);
  }

  async findEnfants(parentId: string) {
    await this.findOneOrFail(parentId);
    return this.parentRepository.findEnfants(parentId);
  }

  /**
   * Inscrit un élève et, si les informations sont fournies, son parent en
   * une seule opération : le parent est réutilisé s'il existe déjà avec ce
   * téléphone (fratrie), sinon créé, puis lié à l'élève.
   */
  async inscrireEleve(dto: InscrireEleveDto): Promise<Eleve> {
    const eleve = await this.eleveService.create(dto);

    if (dto.parent) {
      const parentExistant = await this.parentRepository.findByTelephone(
        dto.parent.telephone,
      );
      const parent = parentExistant ?? (await this.create(dto.parent));
      await this.lierEnfant(parent.id, eleve.id);
    }

    return eleve;
  }
}
