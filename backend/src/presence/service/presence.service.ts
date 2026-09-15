import { Injectable, NotFoundException } from '@nestjs/common';
import { PresenceRepository } from '../repository/presence.repository';
import { AccesClasseService } from '../../common/acces-classe/acces-classe.service';
import { PresenceStatut } from '../../common/enums/presence-statut.enum';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

@Injectable()
export class PresenceService {
  constructor(
    private readonly presenceRepository: PresenceRepository,
    private readonly accesClasseService: AccesClasseService,
  ) {}

  async findOneOrFail(id: string) {
    const presence = await this.presenceRepository.findById(id);
    if (!presence) {
      throw new NotFoundException('Présence introuvable');
    }
    return presence;
  }

  async findOneForUser(user: AuthenticatedUser, id: string) {
    const presence = await this.findOneOrFail(id);
    await this.accesClasseService.assertLectureAutorisee(
      user,
      presence.appel.classeId,
    );
    return presence;
  }

  async justifier(id: string, adminUserId: string, justification: string) {
    const presence = await this.findOneOrFail(id);
    presence.statut = PresenceStatut.ABSENT_JUSTIFIE;
    presence.justification = justification;
    presence.justifieParUserId = adminUserId;
    presence.justifieAt = new Date();
    return this.presenceRepository.save(presence);
  }
}
