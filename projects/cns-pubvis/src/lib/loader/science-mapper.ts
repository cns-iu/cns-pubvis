const fs = require('fs');

import { access, chain } from '@ngx-dino/core';
import { issnLookup, journalNameLookup, journalIdSubdLookup } from '@ngx-dino/science-map';

import { RawPublication } from './raw-publication';
import { toString } from './utils';


export function addScienceMappings(pubs: RawPublication[]) {
  const journalReplacements = {};
  let badJournals: any = {};
  let journal2weights: any = {};
  let journal2journalId: any = {};
  pubs.forEach((pub) => {
    const journal = journalReplacements[pub.journalName] || pub.journalName || pub.journalFullname;
    const isbn = (`${pub.issn} ${pub.eissn}`).trim().split(/\s+/g)
      .map(s => chain(issnLookup, access('id'), toString).get(s)).filter(s => !!s && s !== 'undefined');
    if (!pub.journalId) {
      if (isbn.length > 0) {
        pub.journalId = isbn[0];
        journal2weights[pub.journalId] = journalIdSubdLookup.get(pub.journalId);
      } else {
        pub.journalId = undefined;
      }
    }
    if (!pub.journalId) {
      if (!journal2journalId.hasOwnProperty(journal)) {
        pub.journalId = journal2journalId[journal] = chain(journalNameLookup, access('id'), toString).get(journal);
        if (pub.journalId === 'undefined') {
          pub.journalId = undefined;
        }
        if (pub.journalId) {
          journal2weights[pub.journalId] = journalIdSubdLookup.get(pub.journalId);
        } else {
          pub.journalId = undefined;
        }
      } else {
        pub.journalId = journal2journalId[journal];
      }
    }
    if (pub.journalId === 'undefined') {
      pub.journalId = undefined;
    }
    if (!pub.journalId) {
      badJournals[`${pub.journalName}`] = (badJournals[`${pub.journalName}`] || 0) + 1;
    }

    pub.subdisciplines = journal2weights[pub.journalId] || [];
  });

  journal2journalId = null;
  journal2weights = null;

  console.log('# Bad Journals: ' + Object.keys(badJournals).length);
  const WRITE_BAD_JOURNALS = true;
  if (WRITE_BAD_JOURNALS) {
    badJournals = Object.entries(badJournals);
    badJournals.sort((a1, b1) => b1[1] - a1[1]);
    fs.writeFileSync('/tmp/bad.csv', badJournals.map(t => `"${t[0]}", ${t[1]}`).join('\n'), 'utf8');
  }
}
