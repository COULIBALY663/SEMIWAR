import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SignalementService } from '../service/signalement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('signalements')
export class SignalementController {
  constructor(private readonly signalementService: SignalementService) {}

  @Get()
  findAll() {
    return this.signalementService.findAll();
  }

  @Patch(':id/traiter')
  traiter(@Param('id') id: string) {
    return this.signalementService.traiter(id);
  }
}
