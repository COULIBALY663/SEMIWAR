import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PresenceService } from '../service/presence.service';
import { JustifierPresenceDto } from '../dto/justifier-presence.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('presences')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.presenceService.findOneForUser(user, id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/justifier')
  justifier(
    @Param('id') id: string,
    @Body() dto: JustifierPresenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.presenceService.justifier(id, user.userId, dto.justification);
  }
}
