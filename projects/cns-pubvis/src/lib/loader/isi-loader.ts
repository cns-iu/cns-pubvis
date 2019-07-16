
import { map } from '@ngx-dino/core';

import { parseRISRecords, ISI_TAGS } from './ris-reader';
import { readFile } from './utils';
import { RawPublication } from './raw-publication';


const addAffiliation = map<any, RawPublication>((data) => {
  const affiliations = {};
  data.authorsFullname.forEach((a: string) => affiliations[a] = []);

  (data.authorsAddress || []).forEach((a: string) => {
    if (a && a[0] === '[') {
      const authors = a.slice(1, a.indexOf(']')).split(/\s*\;\s*/);
      const affiliation = a.slice(a.indexOf(']') + 1).trim();
      authors.forEach((author) => {
        if (affiliations[author] === undefined) {
          affiliations[author] = [affiliation];
        } else if (affiliations[author].indexOf(affiliation) === -1) {
          affiliations[author].push(affiliation);
        }
      });
    } else if (a && a.length) {
      // If its not linked to author, it only applies to the first author.
      // This likely results in many authors not having an author address
      // when published before 2006.
      const author = data.authorsFullname[0];
      if (affiliations[author].indexOf(a) === -1) {
        affiliations[author].push(a);
      }
    }
  });

  data.authorsAffiliation = data.authorsFullname.map((a: string) => {
    return affiliations[a];
  });
  return data;
});

export function parseISIRecords(isiFile: string): RawPublication[] {
  return parseRISRecords(readFile(isiFile), ISI_TAGS).map(addAffiliation.getter);
}
