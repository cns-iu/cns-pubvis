export interface RawPublication {
  id: string;
  title: string;
  year: string;
  authors: string[];
  authorsFullname: string[];
  authorsAffiliation: string[][];
  journalName: string;
  journalFullname: string;
  issn: string;
  eissn: string;
  numCites: number;

  journalId?: string;
  subdisciplines?: any[];
}
