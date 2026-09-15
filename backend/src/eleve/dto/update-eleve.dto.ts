import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEleveDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsUUID()
  classeId?: string;
}
