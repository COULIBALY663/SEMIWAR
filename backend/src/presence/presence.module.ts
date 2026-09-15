import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presence } from './entity/presence.entity';
import { PresenceRepository } from './repository/presence.repository';
import { PresenceService } from './service/presence.service';
import { PresenceController } from './controllers/presence.controller';
import { AccesClasseModule } from '../common/acces-classe/acces-classe.module';

@Module({
  imports: [TypeOrmModule.forFeature([Presence]), AccesClasseModule],
  controllers: [PresenceController],
  providers: [PresenceRepository, PresenceService],
  exports: [PresenceRepository, PresenceService],
})
export class PresenceModule {}
