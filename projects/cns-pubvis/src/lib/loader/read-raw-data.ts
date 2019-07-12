const fs = require('fs');

import gexf from 'gexf';
import { orderBy, zip } from 'lodash';
import { parse } from 'papaparse';
import { Operator, access, autoId, chain, combine, constant, map } from '@ngx-dino/core';
import { issnLookup, journalNameLookup, journalIdSubdLookup } from '@ngx-dino/science-map';

import { CoAuthorNetwork } from '../shared/coauthor-network';
import { parseRISRecords, ISI_TAGS } from './ris-reader';

// FIXME: use a cmd line argument parser to make this cleaner
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`${process.argv[1]}: isiFile [disambiguationCSV] coauthGexf outputJson`);
  process.exit();
}
const disambiguate = args.length === 4;

const PUBS = args[0];
const AUTH_DISAMBIGUATION = disambiguate ? args[1] : 'none';
const COAUTH_GEXF = disambiguate ? args[2] : args[1];
const DB_JSON = disambiguate ? args[3] : args[2];

// const COAUTH_JSON = '../../raw-data/coauthor-network.json';

function readFile(inputFile: string): string {
  return fs.readFileSync(inputFile, 'utf8');
}
function writeJSON(outputFile: string, obj: any) {
  fs.writeFileSync(outputFile, JSON.stringify(obj, null, 2), 'utf8');
}
function readGexfFile(gexfFile: string): any {
  return gexf.parse(readFile(gexfFile));
}
function readCSVFile(csvFile: string): any[] {
  return parse(readFile(csvFile), {header: true, skipEmptyLines: true}).data;
}

function a(field: string): Operator<any, any> {
  return chain(access<any>(field, '-'), map<any, any>((val) => val === '-' ? undefined : val));
}
function NumberOrUndefined(value: string): number {
  const numberValue = Number(value);
  return isNaN(numberValue) ? undefined : numberValue;
}
function n(field: string): Operator<any, number> {
  return chain(a(field), map(NumberOrUndefined));
}
const toString = map((x) => x === undefined || x === '' ? undefined : '' + x);
const normalizeAuthor = map<string, string>(author => {
  const a1 = (author || '').split(',');
  if (a1.length > 1) {
    return a1.slice(0, -1).join(',') + ',' + a1[a1.length - 1].toUpperCase();
  } else {
    return author;
  }
});

interface RawPublication {
  id: string;
  title: string;
  year: string;
  authors: string[];
  authorsFullname: string[];
  journalName: string;
  journalFullname: string;
  issn: string;
  eissn: string;

  journalId?: string;
  subdisciplines?: any[];
}

const popAuthorSplit = chain(
  a('Authors'),
  map(s => {
    return (s || '')
      .replace('...', '').replace('…', '') // remove ...'s
      .split(',') // split into authors
      .map(x => x.trim()) // trim excess
      .filter(x => x.length !== 0); // remove empty authors after processing
  })
);

const popJournal = chain(
  a('Source'),
  map(s => (s || '').replace('...', '').replace('…', '').trim())
);

const popRecordProcessor = combine<any, RawPublication>({
  'id': autoId('POP:', 1),
  'title': a('Title'),
  'year': n('Year'),
  'authors': popAuthorSplit,
  'authorsFullname': popAuthorSplit,
  'journalName': popJournal,
  'journalFullname': a('Source'),
  'issn': a('ISSN'),
  'eissn': constant('')
});

function parsePoPRecords(csvFile: string): RawPublication[] {
  return readCSVFile(csvFile).map(popRecordProcessor.getter);
}
function parseISIRecords(isiFile: string): RawPublication[] {
  return parseRISRecords(readFile(PUBS), ISI_TAGS);
}

let pubs: RawPublication[] = [];
switch (PUBS.slice(-3)) {
  case 'isi':
    pubs = parseISIRecords(PUBS);
    break;
  case 'csv':
    pubs = parsePoPRecords(PUBS);
    break;
}

// SciMap here
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

const authorRemaps = {};
const fullnameRemaps = {};
if (fs.existsSync(AUTH_DISAMBIGUATION)) {
  const na = normalizeAuthor.getter;
  for (const record of readCSVFile(AUTH_DISAMBIGUATION)) {
    if (record.id && record['name-revised'] && record['name'] !== record['name-revised']) {
      const remap = authorRemaps[record.id] = authorRemaps[record.id] || {};
      remap[na(record.name)] = na(record['name-revised']);
    }
    if (record.id && record['fullname-revised'] && record['fullname'] !== record['fullname-revised']) {
      const remap = fullnameRemaps[record.id] = fullnameRemaps[record.id] || {};
      remap[na(record.fullname)] = na(record['fullname-revised']);
    }
  }
}
const getAuthorsOp = map<any, string[]>(record => {
  const remap = authorRemaps[record.id] || {};
  return (record.authors || []).map(au => normalizeAuthor.get(remap[au] || au));
});
const getAuthorsFullnameOp = map<any, string[]>(record => {
  const remap = fullnameRemaps[record.id] || {};
  return (record.authorsFullname || []).map(au => remap[au] || au);
});

const pubsDBProcessor = combine({
  'id': a('id'),
  'title': a('title'),
  'authors': getAuthorsOp,
  'authorsFullname': getAuthorsFullnameOp,
  'year': n('year'),

  'journalName': a('journalName'),
  'journalId': a('journalId'),
  'subdisciplines': a('subdisciplines')
});
const publications: any[] = pubs.map(pubsDBProcessor.getter);

const author2fullname = {};
orderBy(publications, 'year', 'desc').forEach(pub => {
  for (const [author, fullname] of zip(pub.authors, pub.authorsFullname)) {
    if (!author2fullname.hasOwnProperty(author)) {
      author2fullname[author] = fullname;
    }
  }
});

const coauthorGraph = readGexfFile(COAUTH_GEXF);
writeJSON('/tmp/temp.json', coauthorGraph);
const gexfAuthLabel = {};
const authorMetadata = coauthorGraph.nodes.map((data) => {
  const id = gexfAuthLabel[data.id] = normalizeAuthor.get(data.label);
  return Object.assign({
    id,
    fullname: author2fullname[id] || id,
    xpos: data.viz.position.x,
    ypos: 0 - data.viz.position.y
  }, data.attributes);
});
const coauthorEdges = coauthorGraph.edges.map((data) => {
  const ids = [gexfAuthLabel[data.source], gexfAuthLabel[data.target]];
  ids.sort();
  return Object.assign({
    id: `${ids[0]}|${ids[1]}`,
    source: ids[0],
    target: ids[1],
    weight: data.weight,
  }, data.attributes);
});

const graph = new CoAuthorNetwork(publications);
graph.coauthorEdges.forEach((e) => {
  delete e.author1;
  delete e.author2;
});

const PRINT_INFO = true;
if (PRINT_INFO) {
  const sciPubs = publications.filter((pub) => pub.subdisciplines && pub.subdisciplines.length > 0);
  console.log('Publications:', publications.length);
  console.log('Sci-Mapped Pubs:', sciPubs.length);
  console.log('# unmapped', publications.length - sciPubs.length);
  console.log('% Sci-Mapped', sciPubs.length / publications.length * 100);
  console.log('Authors', graph.authors.length);
  console.log('Co-Author Edges', graph.coauthorEdges.length);
}

const db: any = {
  authorMetadata,
  coauthorEdges,
  publications
};

writeJSON(DB_JSON, db);
// writeJSON(COAUTH_JSON, {nodes: graph.authors, edges: graph.coauthorEdges});
