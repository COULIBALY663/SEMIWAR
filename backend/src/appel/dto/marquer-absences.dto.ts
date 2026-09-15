import { IsArray, IsInt, IsUUID, Min } from 'class-validator';

export class MarquerAbsencesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  eleveIdsAbsents: string[];

  /** Version de l'appel telle que vue par le client (verrou optimiste). */
  @IsInt()
  @Min(1)
  version: number;
}
