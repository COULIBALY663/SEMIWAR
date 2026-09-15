import { IsUUID } from 'class-validator';

export class LierEnfantDto {
  @IsUUID()
  eleveId: string;
}
