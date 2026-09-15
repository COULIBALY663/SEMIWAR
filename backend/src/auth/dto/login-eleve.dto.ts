import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class LoginEleveDto {
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsDateString()
  dateNaissance: string;
}
