import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classe } from './entity/classe.entity';
import { ClasseRepository } from './repository/classe.repository';
import { ClasseService } from './service/classe.service';
import { ClasseController } from './controllers/classe.controller';
import { EleveModule } from '../eleve/eleve.module';

@Module({
  imports: [TypeOrmModule.forFeature([Classe]), EleveModule],
  controllers: [ClasseController],
  providers: [ClasseRepository, ClasseService],
  exports: [ClasseRepository, ClasseService],
})
export class ClasseModule {}
