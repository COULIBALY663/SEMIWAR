import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signalement } from '../entity/signalement.entity';
import { SignalementStatut } from '../../common/enums/signalement-statut.enum';

@Injectable()
export class SignalementRepository {
  constructor(
    @InjectRepository(Signalement)
    private readonly repo: Repository<Signalement>,
  ) {}

  findAll(): Promise<Signalement[]> {
    return this.repo.find({
      relations: { eleve: { classe: true }, trimestre: true },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Signalement | null> {
    return this.repo.findOne({ where: { id } });
  }

  findActif(eleveId: string, trimestreId: string): Promise<Signalement | null> {
    return this.repo.findOne({
      where: { eleveId, trimestreId, statut: SignalementStatut.NOUVEAU },
    });
  }

  create(data: Partial<Signalement>): Promise<Signalement> {
    const signalement = this.repo.create(data);
    return this.repo.save(signalement);
  }

  save(signalement: Signalement): Promise<Signalement> {
    return this.repo.save(signalement);
  }
}
