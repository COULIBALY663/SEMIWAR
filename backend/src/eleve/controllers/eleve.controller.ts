import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EleveService } from '../service/eleve.service';
import { CreateEleveDto } from '../dto/create-eleve.dto';
import { UpdateEleveDto } from '../dto/update-eleve.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../../auth/service/auth.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('eleves')
export class EleveController {
  constructor(private readonly eleveService: EleveService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.eleveService.findByUserIdOrFail(user.userId);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('classeId') classeId?: string) {
    return classeId
      ? this.eleveService.findByClasse(classeId)
      : this.eleveService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eleveService.findOneOrFail(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateEleveDto) {
    return this.eleveService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEleveDto) {
    return this.eleveService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eleveService.remove(id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/reinitialiser-mot-de-passe')
  async reinitialiserMotDePasse(@Param('id') id: string) {
    const motDePasse = await this.eleveService.reinitialiserMotDePasse(id);
    return { motDePasse };
  }
}
