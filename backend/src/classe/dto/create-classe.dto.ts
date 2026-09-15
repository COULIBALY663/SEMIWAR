import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NiveauClasse } from '../../common/enums/niveau-classe.enum';

export class CreateClasseDto {
  @IsEnum(NiveauClasse)
  niveau: NiveauClasse;

  @IsString()
  @IsNotEmpty()
  filiere: string;
}
