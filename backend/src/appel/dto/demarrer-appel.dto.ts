import { IsDateString, IsUUID } from 'class-validator';

export class DemarrerAppelDto {
  @IsUUID()
  creneauId: string;

  @IsDateString()
  date: string;
}
