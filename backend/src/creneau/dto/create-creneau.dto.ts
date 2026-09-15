import { IsEnum, IsUUID, Matches } from 'class-validator';
import { JourSemaine } from '../../common/enums/jour-semaine.enum';

export class CreateCreneauDto {
  @IsUUID()
  classeId: string;

  @IsUUID()
  matiereId: string;

  @IsEnum(JourSemaine)
  jourSemaine: JourSemaine;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'heureDebut doit être au format HH:mm',
  })
  heureDebut: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'heureFin doit être au format HH:mm',
  })
  heureFin: string;
}
