import { Publication } from '../shared/publication';
import { Author, CoAuthorEdge } from '../shared/author';

import { rawDatabase } from './database.data';
import { CoAuthorNetwork } from './coauthor-network';

const NOT_SCIMAPPED = [{subd_id: -1, weight: 1}];

export class PhiDatabase {
  readonly publications: Publication[] = rawDatabase.publications;
  readonly coauthorNetwork: CoAuthorNetwork;
  readonly authors: Author[];
  readonly coauthorEdges: CoAuthorEdge[];

  constructor() {
    const id2pub: any = {};
    this.publications.forEach((p) => {
      id2pub[p.id] = p;
      if (!p.subdisciplines || p.subdisciplines.length === 0) {
        p.subdisciplines = NOT_SCIMAPPED;
      }
    });

    this.coauthorNetwork = new CoAuthorNetwork(rawDatabase.publications, rawDatabase.authorMetadata || {});
    this.authors = this.coauthorNetwork.authors;
    this.coauthorEdges = this.coauthorNetwork.coauthorEdges;
    console.log(this.authors);
  }
}

export const database = new PhiDatabase();
