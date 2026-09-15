import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { Classe } from '../../classe/entity/classe.entity';

@Entity('eleves')
export class Eleve {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  matricule: string;

  @Column({ name: 'date_naissance', type: 'date' })
  dateNaissance: string;

  @Column({ name: 'classe_id', type: 'uuid' })
  classeId: string;

  @ManyToOne(() => Classe)
  @JoinColumn({ name: 'classe_id' })
  classe: Classe;
}
