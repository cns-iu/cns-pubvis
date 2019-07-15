import { chain, map, access, combine, autoId, constant } from '@ngx-dino/core';

import { RawPublication } from './raw-publication';
import { readCSVFile, n } from './utils';


const popAuthorSplit = chain(
  access<string>('Authors'),
  map(s => {
    return (s || '')
      .replace('...', '').replace('…', '') // remove ...'s
      .split(',') // split into authors
      .map(x => x.trim()) // trim excess
      .filter(x => x.length !== 0); // remove empty authors after processing
  })
);

const popJournal = chain(
  access<string>('Source'),
  map(s => (s || '').replace('...', '').replace('…', '').trim())
);

const popRecordProcessor = combine<any, RawPublication>({
  'id': autoId('POP:', 1),
  'title': access('Title'),
  'year': n('Year'),
  'authors': popAuthorSplit,
  'authorsFullname': popAuthorSplit,
  'authorsAffiliation': chain(popAuthorSplit, map(a => a.map(s => []))),
  'journalName': popJournal,
  'journalFullname': access('Source'),
  'issn': access('ISSN'),
  'eissn': constant(''),
  'numCites': access('Cites')
});

export function parsePoPRecords(csvFile: string): RawPublication[] {
  return readCSVFile(csvFile).map(popRecordProcessor.getter);
}
