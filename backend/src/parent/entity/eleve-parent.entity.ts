import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Parent } from './parent.entity';
import { Eleve } from '../../eleve/entity/eleve.entity';

@Entity('eleve_parents')
@Unique(['eleveId', 'parentId'])
export class EleveParent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'eleve_id', type: 'uuid' })
  eleveId: string;

  @ManyToOne(() => Eleve)
  @JoinColumn({ name: 'eleve_id' })
  eleve: Eleve;

  @Column({ name: 'parent_id', type: 'uuid' })
  parentId: string;

  @ManyToOne(() => Parent)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;
}
