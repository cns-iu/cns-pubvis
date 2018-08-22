import { SubdisciplineWeight } from './subdiscipline-weight';


export interface Publication {
  id: number;
  title: string;
  authors: string[];
  year: number;

  journalName: string;
  journalId: number;
  subdisciplines: SubdisciplineWeight[];
}
