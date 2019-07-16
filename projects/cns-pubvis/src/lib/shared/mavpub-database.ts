import { Author, CoAuthorEdge } from './author';
import { CoAuthorNetwork } from './coauthor-network';
import { Publication } from './publication';

const NOT_SCIMAPPED = [{subd_id: -1, weight: 1}];

export class MavPubDatabase {
  readonly publications: Publication[];
  readonly coauthorNetwork: CoAuthorNetwork;
  readonly authors: Author[];
  readonly coauthorEdges: CoAuthorEdge[];

  constructor(rawDatabase: {publications: Publication[], authorMetadata: any[], coauthorEdges: any[]},
      readonly highlightedAffiliations: string[] = []) {
    this.publications = rawDatabase.publications;
    const id2pub: any = {};
    this.publications.forEach((p) => {
      id2pub[p.id] = p;
      if (!p.subdisciplines || p.subdisciplines.length === 0) {
        p.subdisciplines = NOT_SCIMAPPED;
      }
    });
    const id2edge: any = {};
    rawDatabase.coauthorEdges.forEach(e => id2edge[e.id] = e);
    const authorMetadata: any = {};
    rawDatabase.authorMetadata.forEach(a => authorMetadata[a.id] = a);

    this.coauthorNetwork = new CoAuthorNetwork(rawDatabase.publications, authorMetadata, id2edge, highlightedAffiliations);
    this.authors = this.coauthorNetwork.authors;
    this.coauthorEdges = this.coauthorNetwork.coauthorEdges;
  }
}
