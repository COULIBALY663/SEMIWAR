import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trimestre } from './entity/trimestre.entity';
import { TrimestreRepository } from './repository/trimestre.repository';
import { TrimestreService } from './service/trimestre.service';
import { TrimestreController } from './controllers/trimestre.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trimestre])],
  controllers: [TrimestreController],
  providers: [TrimestreRepository, TrimestreService],
  exports: [TrimestreRepository, TrimestreService],
})
export class TrimestreModule {}
