import { Injectable, NotFoundException } from '@nestjs/common';
import { MatiereRepository } from '../repository/matiere.repository';
import { CreateMatiereDto } from '../dto/create-matiere.dto';

@Injectable()
export class MatiereService {
  constructor(private readonly matiereRepository: MatiereRepository) {}

  findAll() {
    return this.matiereRepository.findAll();
  }

  async findOneOrFail(id: string) {
    const matiere = await this.matiereRepository.findById(id);
    if (!matiere) {
      throw new NotFoundException('Matière introuvable');
    }
    return matiere;
  }

  create(dto: CreateMatiereDto) {
    return this.matiereRepository.create(dto.nom);
  }
}
