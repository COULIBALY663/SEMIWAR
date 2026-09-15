import { IsNotEmpty, IsString } from 'class-validator';

export class JustifierPresenceDto {
  @IsString()
  @IsNotEmpty()
  justification: string;
}
