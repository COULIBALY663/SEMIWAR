import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Eleve } from './entity/eleve.entity';
import { EleveRepository } from './repository/eleve.repository';
import { EleveService } from './service/eleve.service';
import { EleveController } from './controllers/eleve.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Eleve])],
  controllers: [EleveController],
  providers: [EleveRepository, EleveService],
  exports: [EleveRepository, EleveService],
})
export class EleveModule {}
