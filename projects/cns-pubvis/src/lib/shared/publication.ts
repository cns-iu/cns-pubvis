import { SubdisciplineWeight } from './subdiscipline-weight';


export interface Publication {
  id: number;
  title: string;
  authors: string[];
  authorsFullname: string[];
  authorsAffiliation: string[][];
  year: number;
  numCites: number;

  journalName: string;
  journalId: number;
  subdisciplines: SubdisciplineWeight[];
}
