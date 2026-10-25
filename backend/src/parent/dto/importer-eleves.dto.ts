import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class LigneImportEleveDto {
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsDateString()
  dateNaissance: string;

  @IsOptional()
  @IsString()
  parentNom?: string;

  @IsOptional()
  @IsString()
  parentPrenom?: string;

  @IsOptional()
  @IsString()
  parentTelephone?: string;
}

export class ImporterElevesDto {
  @IsUUID()
  classeId: string;

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => LigneImportEleveDto)
  eleves: LigneImportEleveDto[];
}

export interface ResultatImportLigne {
  matricule: string;
  statut: 'CREE' | 'IGNORE' | 'ERREUR';
  message?: string;
}
