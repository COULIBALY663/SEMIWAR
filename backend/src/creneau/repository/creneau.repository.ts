import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creneau } from '../entity/creneau.entity';

@Injectable()
export class CreneauRepository {
  constructor(
    @InjectRepository(Creneau) private readonly repo: Repository<Creneau>,
  ) {}

  findByClasseId(classeId: string): Promise<Creneau[]> {
    return this.repo.find({
      where: { classeId },
      relations: { matiere: true },
      order: { jourSemaine: 'ASC', heureDebut: 'ASC' },
    });
  }

  findById(id: string): Promise<Creneau | null> {
    return this.repo.findOne({
      where: { id },
      relations: { matiere: true, classe: true },
    });
  }

  create(data: Partial<Creneau>): Promise<Creneau> {
    const creneau = this.repo.create(data);
    return this.repo.save(creneau);
  }
}
