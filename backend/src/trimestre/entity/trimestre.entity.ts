import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trimestres')
export class Trimestre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: string;

  @Column({ name: 'date_fin', type: 'date' })
  dateFin: string;
}
