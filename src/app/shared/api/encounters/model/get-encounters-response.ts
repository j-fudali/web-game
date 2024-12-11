import { Page } from '../../../interfaces/page';

interface GetEncountersEncounter {
  id: string;
  title: string;
  difficulty: number;
  lastModified: Date;
  modifiedBy: {
    id: string;
    email: string;
  };
}
export type GetEncountersResponse = Page<GetEncountersEncounter>;
