import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eleve } from '../entity/eleve.entity';

@Injectable()
export class EleveRepository {
  constructor(
    @InjectRepository(Eleve) private readonly repo: Repository<Eleve>,
  ) {}

  findAll(): Promise<Eleve[]> {
    return this.repo.find({ relations: { classe: true } });
  }

  findById(id: string): Promise<Eleve | null> {
    return this.repo.findOne({ where: { id }, relations: { classe: true } });
  }

  findByUserId(userId: string): Promise<Eleve | null> {
    return this.repo.findOne({
      where: { userId },
      relations: { classe: true },
    });
  }

  findByClasseId(classeId: string): Promise<Eleve[]> {
    return this.repo.find({ where: { classeId }, order: { nom: 'ASC' } });
  }

  findByMatricule(matricule: string): Promise<Eleve | null> {
    return this.repo.findOne({ where: { matricule } });
  }

  create(data: Partial<Eleve>): Promise<Eleve> {
    const eleve = this.repo.create(data);
    return this.repo.save(eleve);
  }

  save(eleve: Eleve): Promise<Eleve> {
    return this.repo.save(eleve);
  }

  async remove(eleve: Eleve): Promise<void> {
    await this.repo.remove(eleve);
  }
}
