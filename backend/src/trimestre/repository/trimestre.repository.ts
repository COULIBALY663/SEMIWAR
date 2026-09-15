import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Trimestre } from '../entity/trimestre.entity';

@Injectable()
export class TrimestreRepository {
  constructor(
    @InjectRepository(Trimestre)
    private readonly repo: Repository<Trimestre>,
  ) {}

  findAll(): Promise<Trimestre[]> {
    return this.repo.find({ order: { dateDebut: 'ASC' } });
  }

  findById(id: string): Promise<Trimestre | null> {
    return this.repo.findOne({ where: { id } });
  }

  findEnCours(date: string): Promise<Trimestre | null> {
    return this.repo.findOne({
      where: { dateDebut: LessThanOrEqual(date), dateFin: MoreThanOrEqual(date) },
    });
  }

  create(data: Partial<Trimestre>): Promise<Trimestre> {
    const trimestre = this.repo.create(data);
    return this.repo.save(trimestre);
  }
}
