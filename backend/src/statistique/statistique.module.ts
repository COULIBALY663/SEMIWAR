import { Module } from '@nestjs/common';
import { StatistiqueService } from './service/statistique.service';
import { StatistiqueController } from './controllers/statistique.controller';
import { PresenceModule } from '../presence/presence.module';
import { EleveModule } from '../eleve/eleve.module';
import { TrimestreModule } from '../trimestre/trimestre.module';
import { AccesClasseModule } from '../common/acces-classe/acces-classe.module';

@Module({
  imports: [PresenceModule, EleveModule, TrimestreModule, AccesClasseModule],
  controllers: [StatistiqueController],
  providers: [StatistiqueService],
  exports: [StatistiqueService],
})
export class StatistiqueModule {}
