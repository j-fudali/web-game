import { PublicUser } from 'app/shared/interfaces/public-user';

export interface EncountersDto {
  id: string;
  title: string;
  difficulty: number;
  lastModified: Date;
  modifiedBy: PublicUser;
}
