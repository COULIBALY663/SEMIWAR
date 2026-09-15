import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StatistiqueService } from '../service/statistique.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

@UseGuards(JwtAuthGuard)
@Controller('statistiques')
export class StatistiqueController {
  constructor(private readonly statistiqueService: StatistiqueService) {}

  @Get('eleve/:eleveId')
  pourEleve(
    @Param('eleveId') eleveId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('trimestreId') trimestreId?: string,
  ) {
    return this.statistiqueService.pourEleve(user, eleveId, trimestreId);
  }

  @Get('classe/:classeId')
  pourClasse(
    @Param('classeId') classeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('trimestreId') trimestreId?: string,
  ) {
    return this.statistiqueService.pourClasse(user, classeId, trimestreId);
  }
}
