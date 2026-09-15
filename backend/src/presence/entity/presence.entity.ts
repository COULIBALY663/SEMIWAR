import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appel } from '../../appel/entity/appel.entity';
import { Eleve } from '../../eleve/entity/eleve.entity';
import { User } from '../../auth/entity/user.entity';
import { PresenceStatut } from '../../common/enums/presence-statut.enum';

@Entity('presences')
export class Presence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appel_id', type: 'uuid' })
  appelId: string;

  @ManyToOne(() => Appel, (appel) => appel.presences)
  @JoinColumn({ name: 'appel_id' })
  appel: Appel;

  @Column({ name: 'eleve_id', type: 'uuid' })
  eleveId: string;

  @ManyToOne(() => Eleve)
  @JoinColumn({ name: 'eleve_id' })
  eleve: Eleve;

  @Column({
    type: 'enum',
    enum: PresenceStatut,
    default: PresenceStatut.PRESENT,
  })
  statut: PresenceStatut;

  @Column({ type: 'text', nullable: true })
  justification: string | null;

  @Column({ name: 'justifie_par_user_id', type: 'uuid', nullable: true })
  justifieParUserId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'justifie_par_user_id' })
  justifiePar: User | null;

  @Column({ name: 'justifie_at', type: 'timestamptz', nullable: true })
  justifieAt: Date | null;
}
