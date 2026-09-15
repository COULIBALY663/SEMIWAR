import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matiere } from './entity/matiere.entity';
import { MatiereRepository } from './repository/matiere.repository';
import { MatiereService } from './service/matiere.service';
import { MatiereController } from './controllers/matiere.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Matiere])],
  controllers: [MatiereController],
  providers: [MatiereRepository, MatiereService],
  exports: [MatiereRepository, MatiereService],
})
export class MatiereModule {}
