import { Module } from '@nestjs/common';
import { AccesClasseService } from './acces-classe.service';
import { EleveModule } from '../../eleve/eleve.module';
import { ParentModule } from '../../parent/parent.module';

@Module({
  imports: [EleveModule, ParentModule],
  providers: [AccesClasseService],
  exports: [AccesClasseService],
})
export class AccesClasseModule {}
