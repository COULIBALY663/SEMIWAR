import { Controller, Get, UseGuards } from '@nestjs/common';
import { SmsLogRepository } from '../repository/sms-log.repository';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('sms-logs')
export class SmsLogController {
  constructor(private readonly smsLogRepository: SmsLogRepository) {}

  @Get()
  findAll() {
    return this.smsLogRepository.findAll();
  }
}
