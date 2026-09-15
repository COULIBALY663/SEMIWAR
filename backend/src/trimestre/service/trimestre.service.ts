import { Injectable, NotFoundException } from '@nestjs/common';
import { TrimestreRepository } from '../repository/trimestre.repository';
import { CreateTrimestreDto } from '../dto/create-trimestre.dto';

@Injectable()
export class TrimestreService {
  constructor(private readonly trimestreRepository: TrimestreRepository) {}

  findAll() {
    return this.trimestreRepository.findAll();
  }

  async findOneOrFail(id: string) {
    const trimestre = await this.trimestreRepository.findById(id);
    if (!trimestre) {
      throw new NotFoundException('Trimestre introuvable');
    }
    return trimestre;
  }

  async findEnCoursOrFail(date: Date = new Date()) {
    const iso = date.toISOString().slice(0, 10);
    const trimestre = await this.trimestreRepository.findEnCours(iso);
    if (!trimestre) {
      throw new NotFoundException("Aucun trimestre en cours à cette date");
    }
    return trimestre;
  }

  create(dto: CreateTrimestreDto) {
    return this.trimestreRepository.create(dto);
  }
}
