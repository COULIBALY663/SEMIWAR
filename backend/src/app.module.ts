import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { buildTypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { ClasseModule } from './classe/classe.module';
import { EleveModule } from './eleve/eleve.module';
import { ParentModule } from './parent/parent.module';
import { MatiereModule } from './matiere/matiere.module';
import { CreneauModule } from './creneau/creneau.module';
import { AppelModule } from './appel/appel.module';
import { PresenceModule } from './presence/presence.module';
import { TrimestreModule } from './trimestre/trimestre.module';
import { SmsModule } from './sms/sms.module';
import { StatistiqueModule } from './statistique/statistique.module';
import { SignalementModule } from './signalement/signalement.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildTypeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ClasseModule,
    EleveModule,
    ParentModule,
    MatiereModule,
    CreneauModule,
    AppelModule,
    PresenceModule,
    TrimestreModule,
    SmsModule,
    StatistiqueModule,
    SignalementModule,
  ],
})
export class AppModule {}
