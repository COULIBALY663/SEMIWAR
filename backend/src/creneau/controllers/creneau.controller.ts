import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreneauService } from '../service/creneau.service';
import { CreateCreneauDto } from '../dto/create-creneau.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('creneaux')
export class CreneauController {
  constructor(private readonly creneauService: CreneauService) {}

  @Get()
  findByClasse(@Query('classeId') classeId: string) {
    return this.creneauService.findByClasse(classeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creneauService.findOneOrFail(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCreneauDto) {
    return this.creneauService.create(dto);
  }
}
