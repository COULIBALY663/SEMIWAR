import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Eleve } from '../../eleve/entity/eleve.entity';
import { NiveauClasse } from '../../common/enums/niveau-classe.enum';

// Filet de sécurité au niveau base : le contrôle métier (message d'erreur
// clair, insensible à la casse/aux espaces) est fait dans ClasseService.
@Entity('classes')
@Unique(['niveau', 'filiere'])
export class Classe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ type: 'enum', enum: NiveauClasse })
  niveau: NiveauClasse;

  @Column()
  filiere: string;

  @Column({ name: 'chef_id', type: 'uuid', nullable: true })
  chefId: string | null;

  @ManyToOne(() => Eleve, { nullable: true })
  @JoinColumn({ name: 'chef_id' })
  chef: Eleve | null;

  @Column({ name: 'sous_chef_id', type: 'uuid', nullable: true })
  sousChefId: string | null;

  @ManyToOne(() => Eleve, { nullable: true })
  @JoinColumn({ name: 'sous_chef_id' })
  sousChef: Eleve | null;
}
