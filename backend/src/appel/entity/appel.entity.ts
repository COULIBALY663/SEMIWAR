import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Classe } from '../../classe/entity/classe.entity';
import { Creneau } from '../../creneau/entity/creneau.entity';
import { Eleve } from '../../eleve/entity/eleve.entity';
import { AppelStatut } from '../../common/enums/appel-statut.enum';
import { Presence } from '../../presence/entity/presence.entity';

@Entity('appels')
export class Appel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'creneau_id', type: 'uuid' })
  creneauId: string;

  @ManyToOne(() => Creneau)
  @JoinColumn({ name: 'creneau_id' })
  creneau: Creneau;

  @Column({ name: 'classe_id', type: 'uuid' })
  classeId: string;

  @ManyToOne(() => Classe)
  @JoinColumn({ name: 'classe_id' })
  classe: Classe;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'effectue_par_eleve_id', type: 'uuid' })
  effectueParEleveId: string;

  @ManyToOne(() => Eleve)
  @JoinColumn({ name: 'effectue_par_eleve_id' })
  effectuePar: Eleve;

  @Column({ type: 'enum', enum: AppelStatut, default: AppelStatut.EN_COURS })
  statut: AppelStatut;

  @Column({ name: 'position_lat', type: 'float', nullable: true })
  positionLat: number | null;

  @Column({ name: 'position_lng', type: 'float', nullable: true })
  positionLng: number | null;

  @Column({ name: 'position_precision', type: 'float', nullable: true })
  positionPrecision: number | null;

  @Column({ name: 'validated_at', type: 'timestamptz', nullable: true })
  validatedAt: Date | null;

  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt: Date | null;

  // Sert à forcer un changement de colonne scalaire (donc un vrai UPDATE)
  // lorsqu'on modifie uniquement la liste des présences : TypeORM ignore
  // silencieusement .save() si rien de scalaire n'a changé sur l'entité,
  // et donc n'incrémente pas `version` — ce qui casserait le verrou
  // optimiste sur marquerAbsences() sans ce champ.
  @Column({
    name: 'derniere_modification_at',
    type: 'timestamptz',
    nullable: true,
  })
  derniereModificationAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => Presence, (presence) => presence.appel)
  presences: Presence[];
}
