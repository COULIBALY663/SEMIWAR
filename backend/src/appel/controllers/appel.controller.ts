import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppelService } from '../service/appel.service';
import { DemarrerAppelDto } from '../dto/demarrer-appel.dto';
import { MarquerAbsencesDto } from '../dto/marquer-absences.dto';
import { ValiderAppelDto } from '../dto/valider-appel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appels')
export class AppelController {
  constructor(private readonly appelService: AppelService) {}

  @Get()
  findByClasse(
    @Query('classeId') classeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appelService.findByClasseForUser(user, classeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.appelService.findOneForUser(user, id);
  }

  @Roles(Role.ELEVE)
  @Post()
  demarrer(
    @Body() dto: DemarrerAppelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appelService.demarrer(user.userId, dto);
  }

  @Roles(Role.ELEVE)
  @Patch(':id/presences')
  marquerAbsences(
    @Param('id') id: string,
    @Body() dto: MarquerAbsencesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appelService.marquerAbsences(user.userId, id, dto);
  }

  @Roles(Role.ELEVE)
  @Post(':id/valider')
  valider(
    @Param('id') id: string,
    @Body() dto: ValiderAppelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.appelService.valider(user.userId, id, dto);
  }
}
