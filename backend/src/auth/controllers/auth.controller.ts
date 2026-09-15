import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { LoginEleveDto } from '../dto/login-eleve.dto';
import { LoginChefDto } from '../dto/login-chef.dto';
import { LoginParentDto } from '../dto/login-parent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginThrottleGuard } from '../../common/guards/login-throttle.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EleveService } from '../../eleve/service/eleve.service';
import { ParentService } from '../../parent/service/parent.service';
import type { AuthenticatedUser } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly eleveService: EleveService,
    private readonly parentService: ParentService,
  ) {}

  @UseGuards(LoginThrottleGuard)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(LoginThrottleGuard)
  @Post('login/eleve')
  loginEleve(@Body() dto: LoginEleveDto) {
    return this.eleveService.login(dto.matricule, dto.dateNaissance);
  }

  @UseGuards(LoginThrottleGuard)
  @Post('login/chef')
  loginChef(@Body() dto: LoginChefDto) {
    return this.eleveService.loginAvecMotDePasse(dto.matricule, dto.password);
  }

  @UseGuards(LoginThrottleGuard)
  @Post('login/parent')
  loginParent(@Body() dto: LoginParentDto) {
    return this.parentService.login(dto.telephone, dto.nom);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
