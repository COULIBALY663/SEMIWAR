import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateTrimestreDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}
