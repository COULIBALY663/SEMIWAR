import { Injectable, NotFoundException } from '@nestjs/common';
import { CreneauRepository } from '../repository/creneau.repository';
import { CreateCreneauDto } from '../dto/create-creneau.dto';

@Injectable()
export class CreneauService {
  constructor(private readonly creneauRepository: CreneauRepository) {}

  findByClasse(classeId: string) {
    return this.creneauRepository.findByClasseId(classeId);
  }

  async findOneOrFail(id: string) {
    const creneau = await this.creneauRepository.findById(id);
    if (!creneau) {
      throw new NotFoundException('Créneau introuvable');
    }
    return creneau;
  }

  create(dto: CreateCreneauDto) {
    return this.creneauRepository.create(dto);
  }
}
