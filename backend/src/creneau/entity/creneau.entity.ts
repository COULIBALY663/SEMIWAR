import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Classe } from '../../classe/entity/classe.entity';
import { Matiere } from '../../matiere/entity/matiere.entity';
import { JourSemaine } from '../../common/enums/jour-semaine.enum';

@Entity('creneaux')
export class Creneau {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'classe_id', type: 'uuid' })
  classeId: string;

  @ManyToOne(() => Classe)
  @JoinColumn({ name: 'classe_id' })
  classe: Classe;

  @Column({ name: 'matiere_id', type: 'uuid' })
  matiereId: string;

  @ManyToOne(() => Matiere)
  @JoinColumn({ name: 'matiere_id' })
  matiere: Matiere;

  @Column({ name: 'jour_semaine', type: 'enum', enum: JourSemaine })
  jourSemaine: JourSemaine;

  @Column({ name: 'heure_debut', type: 'time' })
  heureDebut: string;

  @Column({ name: 'heure_fin', type: 'time' })
  heureFin: string;

  get dureeHeures(): number {
    const [hd, md] = this.heureDebut.split(':').map(Number);
    const [hf, mf] = this.heureFin.split(':').map(Number);
    return (hf * 60 + mf - (hd * 60 + md)) / 60;
  }
}
