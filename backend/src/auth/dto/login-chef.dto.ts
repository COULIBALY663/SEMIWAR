import { IsNotEmpty, IsString } from 'class-validator';

export class LoginChefDto {
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
