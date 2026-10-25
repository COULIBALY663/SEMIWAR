import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SmsLogRepository } from '../repository/sms-log.repository';
import { SmsService } from '../service/sms.service';
import { EnvoyerSmsTestDto } from '../dto/envoyer-sms-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('sms-logs')
export class SmsLogController {
  constructor(
    private readonly smsLogRepository: SmsLogRepository,
    private readonly smsService: SmsService,
  ) {}

  @Get()
  findAll() {
    return this.smsLogRepository.findAll();
  }

  @Post('test')
  envoyerTest(@Body() dto: EnvoyerSmsTestDto) {
    return this.smsService.envoyerTest(dto.telephone);
  }
}
