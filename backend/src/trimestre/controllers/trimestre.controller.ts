import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TrimestreService } from '../service/trimestre.service';
import { CreateTrimestreDto } from '../dto/create-trimestre.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trimestres')
export class TrimestreController {
  constructor(private readonly trimestreService: TrimestreService) {}

  @Get()
  findAll() {
    return this.trimestreService.findAll();
  }

  @Get('en-cours')
  findEnCours() {
    return this.trimestreService.findEnCoursOrFail();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trimestreService.findOneOrFail(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTrimestreDto) {
    return this.trimestreService.create(dto);
  }
}
