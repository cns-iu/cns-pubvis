import { Publication } from './publication';
import { Author, CoAuthorEdge } from './author';

import { CoAuthorNetwork } from './coauthor-network';

const NOT_SCIMAPPED = [{subd_id: -1, weight: 1}];

export class MavPubDatabase {
  readonly publications: Publication[];
  readonly coauthorNetwork: CoAuthorNetwork;
  readonly authors: Author[];
  readonly coauthorEdges: CoAuthorEdge[];

  constructor(rawDatabase: {publications: Publication[], authorMetadata: any[]}) {
    this.publications = rawDatabase.publications;
    const id2pub: any = {};
    this.publications.forEach((p) => {
      id2pub[p.id] = p;
      if (!p.subdisciplines || p.subdisciplines.length === 0) {
        p.subdisciplines = NOT_SCIMAPPED;
      }
    });

    const authorMetadata: any = {};
    rawDatabase.authorMetadata.forEach(a => authorMetadata[a.id] = a);

    this.coauthorNetwork = new CoAuthorNetwork(rawDatabase.publications, authorMetadata);
    this.authors = this.coauthorNetwork.authors;
    this.coauthorEdges = this.coauthorNetwork.coauthorEdges;
  }
}
