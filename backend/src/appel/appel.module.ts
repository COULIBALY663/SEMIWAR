import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appel } from './entity/appel.entity';
import { AppelRepository } from './repository/appel.repository';
import { AppelService } from './service/appel.service';
import { AppelController } from './controllers/appel.controller';
import { PresenceModule } from '../presence/presence.module';
import { EleveModule } from '../eleve/eleve.module';
import { ClasseModule } from '../classe/classe.module';
import { CreneauModule } from '../creneau/creneau.module';
import { ParentModule } from '../parent/parent.module';
import { SmsModule } from '../sms/sms.module';
import { AccesClasseModule } from '../common/acces-classe/acces-classe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appel]),
    PresenceModule,
    EleveModule,
    ClasseModule,
    CreneauModule,
    ParentModule,
    SmsModule,
    AccesClasseModule,
  ],
  controllers: [AppelController],
  providers: [AppelRepository, AppelService],
  exports: [AppelRepository, AppelService],
})
export class AppelModule {}
