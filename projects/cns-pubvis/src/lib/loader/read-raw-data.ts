const fs = require('fs');

import gexf from 'gexf';
import { parse } from 'papaparse';
import { Operator, access, chain, combine, map } from '@ngx-dino/core';
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
  return parse(readFile(csvFile), {header: true}).data;
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
const toString = map((x) => '' + x);
const normalizeAuthor = map<string, string>(author => {
  const a1 = (author || '').split(',');
  return a1.slice(0, -1).join(',') + ',' + a1[a1.length - 1].toUpperCase();
});

const pubs: any[] = parseRISRecords(readFile(PUBS), ISI_TAGS);

// SciMap here
const journalReplacements = {};
let badJournals: any = {};
let journal2weights: any = {};
let journal2journ_id: any = {};
pubs.forEach((pub) => {
  const journal = journalReplacements[pub.journalName] || pub.journalName || pub.journalFullname;
  const isbn = (`${pub.issn} ${pub.eissn}`).trim().split(/\s+/g)
    .map(s => chain(issnLookup, access('id'), toString).get(s)).filter(s => !!s);
  if (!pub.journ_id) {
    if (isbn.length > 0) {
      pub.journ_id = isbn[0];
      journal2weights[pub.journ_id] = journalIdSubdLookup.get(pub.journ_id);
    } else {
      pub.journ_id = undefined;
    }
  }
  if (!pub.journ_id) {
    if (!journal2journ_id.hasOwnProperty(journal)) {
      pub.journ_id = journal2journ_id[journal] = chain(journalNameLookup, access('id'), toString).get(journal);
      if (pub.journ_id) {
        journal2weights[pub.journ_id] = journalIdSubdLookup.get(pub.journ_id);
      } else {
        pub.journ_id = undefined;
      }
    } else {
      pub.journ_id = journal2journ_id[journal];
    }
  }
  if (!pub.journ_id) {
    badJournals[`${pub.journalName}`] = (badJournals[`${pub.journalName}`] || 0) + 1;
  }

  pub.subdisciplines = journal2weights[pub.journ_id] || [];
});

journal2journ_id = null;
journal2weights = null;

const WRITE_BAD_JOURNALS = true;
if (WRITE_BAD_JOURNALS) {
  badJournals = Object.entries(badJournals);
  badJournals.sort((a1, b1) => b1[1] - a1[1]);
  fs.writeFileSync('/tmp/bad.csv', badJournals.map(t => `"${t[0]}", ${t[1]}`).join('\n'), 'utf8');
}

const authorRemaps = {};
if (fs.existsSync(AUTH_DISAMBIGUATION)) {
  const na = normalizeAuthor.getter;
  for (const record of readCSVFile(AUTH_DISAMBIGUATION)) {
    if (record.id && record['name-revised'] && record['name'] !== record['name-revised']) {
      const remap = authorRemaps[record.id] = authorRemaps[record.id] || {};
      remap[na(record.name)] = na(record['name-revised']);
    }
  }
}
const getAuthorsOp = map<any, string[]>(record => {
  const remap = authorRemaps[record.wosId] || {};
  return (record.authors || []).map(au => normalizeAuthor.get(remap[au] || au));
});

const pubsDBProcessor = combine({
  'id': a('wosId'),
  'title': a('title'),
  'authors': getAuthorsOp,
  'year': n('publicationYear'),

  'journalName': a('journalName'),
  'journalId': a('journ_id'),
  'subdisciplines': a('subdisciplines')
});
const publications: any[] = pubs.map(pubsDBProcessor.getter);

const coauthorGraph = readGexfFile(COAUTH_GEXF);
writeJSON('/tmp/temp.json', coauthorGraph);
const gexfAuthLabel = {};
const authorMetadata = coauthorGraph.nodes.map((data) => {
  gexfAuthLabel[data.id] = normalizeAuthor.get(data.label);
  return Object.assign({
    id: gexfAuthLabel[data.id],
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
