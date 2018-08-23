export interface Filter {
  limit: number;
  sort: {field: string, ascending?: boolean}[];
  subd_id: number[];
  year: {start: number, end: number};
  journalName: string[];
}
