import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Creneau } from './entity/creneau.entity';
import { CreneauRepository } from './repository/creneau.repository';
import { CreneauService } from './service/creneau.service';
import { CreneauController } from './controllers/creneau.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Creneau])],
  controllers: [CreneauController],
  providers: [CreneauRepository, CreneauService],
  exports: [CreneauRepository, CreneauService],
})
export class CreneauModule {}
