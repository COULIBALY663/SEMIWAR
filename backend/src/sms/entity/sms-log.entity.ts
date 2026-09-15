import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SmsStatut } from '../../common/enums/sms-statut.enum';

@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'presence_id', type: 'uuid' })
  presenceId: string;

  @Column({ name: 'parent_id', type: 'uuid' })
  parentId: string;

  @Column()
  telephone: string;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: SmsStatut })
  statut: SmsStatut;

  @Column({ name: 'provider_ref', type: 'varchar', nullable: true })
  providerRef: string | null;

  @Column({ name: 'erreur', type: 'text', nullable: true })
  erreur: string | null;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}
