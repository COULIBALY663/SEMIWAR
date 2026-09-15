import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matiere } from '../entity/matiere.entity';

@Injectable()
export class MatiereRepository {
  constructor(
    @InjectRepository(Matiere) private readonly repo: Repository<Matiere>,
  ) {}

  findAll(): Promise<Matiere[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<Matiere | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(nom: string): Promise<Matiere> {
    const matiere = this.repo.create({ nom });
    return this.repo.save(matiere);
  }
}
