import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Signalement } from './entity/signalement.entity';
import { SignalementRepository } from './repository/signalement.repository';
import { SignalementService } from './service/signalement.service';
import { SignalementController } from './controllers/signalement.controller';
import { ClasseModule } from '../classe/classe.module';
import { EleveModule } from '../eleve/eleve.module';
import { StatistiqueModule } from '../statistique/statistique.module';
import { TrimestreModule } from '../trimestre/trimestre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Signalement]),
    ClasseModule,
    EleveModule,
    StatistiqueModule,
    TrimestreModule,
  ],
  controllers: [SignalementController],
  providers: [SignalementRepository, SignalementService],
  exports: [SignalementService],
})
export class SignalementModule {}
