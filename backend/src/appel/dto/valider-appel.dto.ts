import { IsInt, IsNumber, Min } from 'class-validator';

export class ValiderAppelDto {
  @IsNumber()
  positionLat: number;

  @IsNumber()
  positionLng: number;

  @IsNumber()
  positionPrecision: number;

  /** Version de l'appel telle que vue par le client (verrou optimiste). */
  @IsInt()
  @Min(1)
  version: number;
}
