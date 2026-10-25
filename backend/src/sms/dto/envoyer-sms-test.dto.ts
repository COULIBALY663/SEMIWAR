import { IsNotEmpty, IsString } from 'class-validator';

export class EnvoyerSmsTestDto {
  @IsString()
  @IsNotEmpty()
  telephone: string;
}
