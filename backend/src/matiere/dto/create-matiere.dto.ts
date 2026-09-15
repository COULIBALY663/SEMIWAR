import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMatiereDto {
  @IsString()
  @IsNotEmpty()
  nom: string;
}
