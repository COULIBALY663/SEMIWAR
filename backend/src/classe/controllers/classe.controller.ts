import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClasseService } from '../service/classe.service';
import { CreateClasseDto } from '../dto/create-classe.dto';
import { UpdateClasseDto } from '../dto/update-classe.dto';
import { AffecterResponsableDto } from '../dto/affecter-responsable.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClasseController {
  constructor(private readonly classeService: ClasseService) {}

  @Get()
  findAll() {
    return this.classeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classeService.findOneOrFail(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateClasseDto) {
    return this.classeService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClasseDto) {
    return this.classeService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classeService.remove(id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/responsable')
  affecterResponsable(
    @Param('id') id: string,
    @Body() dto: AffecterResponsableDto,
  ) {
    return this.classeService.affecterResponsable(id, dto);
  }
}
