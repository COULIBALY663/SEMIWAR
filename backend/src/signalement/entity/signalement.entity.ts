import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Eleve } from '../../eleve/entity/eleve.entity';
import { Trimestre } from '../../trimestre/entity/trimestre.entity';
import { SignalementStatut } from '../../common/enums/signalement-statut.enum';

@Entity('signalements')
export class Signalement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'eleve_id', type: 'uuid' })
  eleveId: string;

  @ManyToOne(() => Eleve)
  @JoinColumn({ name: 'eleve_id' })
  eleve: Eleve;

  @Column({ name: 'trimestre_id', type: 'uuid' })
  trimestreId: string;

  @ManyToOne(() => Trimestre)
  @JoinColumn({ name: 'trimestre_id' })
  trimestre: Trimestre;

  @Column({ name: 'nb_absences_non_justifiees' })
  nbAbsencesNonJustifiees: number;

  @Column({
    type: 'enum',
    enum: SignalementStatut,
    default: SignalementStatut.NOUVEAU,
  })
  statut: SignalementStatut;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
