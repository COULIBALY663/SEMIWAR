import { IsNotEmpty, IsString } from 'class-validator';

export class LoginParentDto {
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsNotEmpty()
  nom: string;
}
