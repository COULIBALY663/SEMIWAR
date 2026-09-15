import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('matieres')
export class Matiere {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nom: string;
}
