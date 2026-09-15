import { ForbiddenException, Injectable } from '@nestjs/common';
import { EleveService } from '../../eleve/service/eleve.service';
import { ParentRepository } from '../../parent/repository/parent.repository';
import { Role } from '../enums/role.enum';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

/**
 * Règle d'accès en lecture partagée par les modules exposant des données
 * rattachées à une classe (appels, présences, statistiques) : un admin peut
 * tout voir, un élève uniquement sa propre classe, un parent uniquement la
 * classe d'un de ses enfants.
 */
@Injectable()
export class AccesClasseService {
  constructor(
    private readonly eleveService: EleveService,
    private readonly parentRepository: ParentRepository,
  ) {}

  async assertLectureAutorisee(
    user: AuthenticatedUser,
    classeId: string,
  ): Promise<void> {
    if (user.role === Role.ADMIN) {
      return;
    }
    if (user.role === Role.ELEVE) {
      const eleve = await this.eleveService.findByUserIdOrFail(user.userId);
      if (eleve.classeId === classeId) {
        return;
      }
    } else if (user.role === Role.PARENT) {
      const parent = await this.parentRepository.findByUserId(user.userId);
      const enfants = parent
        ? await this.parentRepository.findEnfants(parent.id)
        : [];
      if (enfants.some((enfant) => enfant.classeId === classeId)) {
        return;
      }
    }
    throw new ForbiddenException(
      "Vous n'avez pas accès aux données de cette classe",
    );
  }
}
