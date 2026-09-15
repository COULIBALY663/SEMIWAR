import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ParentService } from '../service/parent.service';
import { InscrireEleveDto } from '../dto/inscrire-eleve.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

/**
 * Route d'inscription combinée élève + parent (`POST /eleves/inscription`).
 * Vit dans ParentModule (et non EleveModule) car elle a besoin de
 * ParentService, et ParentModule dépend déjà d'EleveModule — l'inverse
 * créerait un import de module circulaire.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('eleves')
export class InscriptionController {
  constructor(private readonly parentService: ParentService) {}

  @Post('inscription')
  inscrire(@Body() dto: InscrireEleveDto) {
    return this.parentService.inscrireEleve(dto);
  }
}
