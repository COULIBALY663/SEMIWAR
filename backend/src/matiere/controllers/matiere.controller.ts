import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MatiereService } from '../service/matiere.service';
import { CreateMatiereDto } from '../dto/create-matiere.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('matieres')
export class MatiereController {
  constructor(private readonly matiereService: MatiereService) {}

  @Get()
  findAll() {
    return this.matiereService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matiereService.findOneOrFail(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateMatiereDto) {
    return this.matiereService.create(dto);
  }
}
