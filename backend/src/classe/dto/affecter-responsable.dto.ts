import { IsIn, IsUUID } from 'class-validator';

export class AffecterResponsableDto {
  @IsUUID()
  eleveId: string;

  @IsIn(['CHEF', 'SOUS_CHEF'])
  poste: 'CHEF' | 'SOUS_CHEF';
}
