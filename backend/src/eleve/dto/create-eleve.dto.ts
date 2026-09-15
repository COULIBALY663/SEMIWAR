import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateEleveDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsDateString()
  dateNaissance: string;

  @IsUUID()
  classeId: string;
}
