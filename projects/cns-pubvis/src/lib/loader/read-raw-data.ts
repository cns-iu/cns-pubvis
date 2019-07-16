const fs = require('fs');

import { orderBy, zip } from 'lodash';
import { combine, map } from '@ngx-dino/core';

import { CoAuthorNetwork } from '../shared/coauthor-network';
import { Publication } from '../shared/publication';
import { RawPublication } from './raw-publication';
import { parsePoPRecords } from './pop-loader';
import { parseISIRecords } from './isi-loader';
import { normalizeAuthor, readCSVFile, a, n, writeJSON, readGexfFile, toString } from './utils';
import { addScienceMappings } from './science-mapper';


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

let pubs: RawPublication[] = [];
switch (PUBS.slice(-3)) {
  case 'isi':
    pubs = parseISIRecords(PUBS);
    break;
  case 'csv':
    pubs = parsePoPRecords(PUBS);
    break;
}

addScienceMappings(pubs);

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

const pubsDBProcessor = combine<any, Publication>({
  'id': a('id'),
  'title': a('title'),
  'authors': getAuthorsOp,
  'authorsFullname': getAuthorsFullnameOp,
  'authorsAffiliation': a('authorsAffiliation'),
  'year': n('year'),
  'numCites': n('numCites'),

  'journalName': a('journalName'),
  'journalId': a('journalId'),
  'subdisciplines': a('subdisciplines')
});
const publications: Publication[] = pubs.map(pubsDBProcessor.getter);

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
