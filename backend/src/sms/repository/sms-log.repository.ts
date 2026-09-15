import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsLog } from '../entity/sms-log.entity';

@Injectable()
export class SmsLogRepository {
  constructor(
    @InjectRepository(SmsLog) private readonly repo: Repository<SmsLog>,
  ) {}

  create(data: Partial<SmsLog>): Promise<SmsLog> {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }

  findAll(): Promise<SmsLog[]> {
    return this.repo.find({ order: { sentAt: 'DESC' }, take: 200 });
  }
}
