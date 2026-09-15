import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entity/parent.entity';
import { EleveParent } from './entity/eleve-parent.entity';
import { ParentRepository } from './repository/parent.repository';
import { ParentService } from './service/parent.service';
import { ParentController } from './controllers/parent.controller';
import { InscriptionController } from './controllers/inscription.controller';
import { EleveModule } from '../eleve/eleve.module';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, EleveParent]), EleveModule],
  controllers: [ParentController, InscriptionController],
  providers: [ParentRepository, ParentService],
  exports: [ParentRepository, ParentService],
})
export class ParentModule {}
