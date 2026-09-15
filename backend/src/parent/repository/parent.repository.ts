import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../entity/parent.entity';
import { EleveParent } from '../entity/eleve-parent.entity';

@Injectable()
export class ParentRepository {
  constructor(
    @InjectRepository(Parent) private readonly repo: Repository<Parent>,
    @InjectRepository(EleveParent)
    private readonly eleveParentRepo: Repository<EleveParent>,
  ) {}

  findAll(): Promise<Parent[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<Parent | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUserId(userId: string): Promise<Parent | null> {
    return this.repo.findOne({ where: { userId } });
  }

  findByTelephone(telephone: string): Promise<Parent | null> {
    return this.repo.findOne({ where: { telephone } });
  }

  create(data: Partial<Parent>): Promise<Parent> {
    const parent = this.repo.create(data);
    return this.repo.save(parent);
  }

  async lierEnfant(parentId: string, eleveId: string): Promise<EleveParent> {
    const lien = this.eleveParentRepo.create({ parentId, eleveId });
    return this.eleveParentRepo.save(lien);
  }

  async findEnfants(parentId: string) {
    const liens = await this.eleveParentRepo.find({
      where: { parentId },
      relations: { eleve: { classe: true } },
    });
    return liens.map((l) => l.eleve);
  }

  async findParentsByEleveId(eleveId: string): Promise<Parent[]> {
    const liens = await this.eleveParentRepo.find({
      where: { eleveId },
      relations: { parent: true },
    });
    return liens.map((l) => l.parent);
  }

  async lienExiste(parentId: string, eleveId: string): Promise<boolean> {
    const count = await this.eleveParentRepo.count({
      where: { parentId, eleveId },
    });
    return count > 0;
  }
}
