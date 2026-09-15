import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParentService } from '../service/parent.service';
import { CreateParentDto } from '../dto/create-parent.dto';
import { LierEnfantDto } from '../dto/lier-enfant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const parent = await this.parentService.findByUserIdOrFail(user.userId);
    const enfants = await this.parentService.findEnfants(parent.id);
    return { ...parent, enfants };
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.parentService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentService.findOneOrFail(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateParentDto) {
    return this.parentService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Post(':id/enfants')
  lierEnfant(@Param('id') id: string, @Body() dto: LierEnfantDto) {
    return this.parentService.lierEnfant(id, dto.eleveId);
  }

  @Roles(Role.ADMIN)
  @Get(':id/enfants')
  enfants(@Param('id') id: string) {
    return this.parentService.findEnfants(id);
  }
}
