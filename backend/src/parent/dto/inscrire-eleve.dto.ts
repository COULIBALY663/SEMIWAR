import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateEleveDto } from '../../eleve/dto/create-eleve.dto';

class ParentInscriptionDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;
}

export class InscrireEleveDto extends CreateEleveDto {
  /**
   * Optionnel : si fourni, un parent est créé (ou réutilisé s'il existe déjà
   * avec ce téléphone, cas des fratries) et lié à l'élève dans la foulée.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => ParentInscriptionDto)
  parent?: ParentInscriptionDto;
}
