import { Author, AuthorStats, CoAuthorEdge, CoAuthorEdgeStats } from './author';
import { Publication } from './publication';

export class CoAuthorNetwork {
  readonly authors: Author[] = [];
  readonly coauthorEdges: CoAuthorEdge[] = [];

  private id2author: { [id: string]: Author } = {};
  private id2edge: { [id: string]: CoAuthorEdge } = {};
  readonly authorStats = new AuthorStats();
  readonly coauthorEdgeStats = new CoAuthorEdgeStats();

  constructor(private publications: Publication[], private authorMetadata: { [id: string]: any } = {},
      private edgeMetadata: { [id: string]: Partial<CoAuthorEdge> } = null) {
    this.buildGraph();
  }

  private buildGraph() {
    // Pre-populate nodes/edges from metadata
    Object.keys(this.authorMetadata || {}).forEach(a => this.getAuthor(a));
    Object.keys(this.edgeMetadata || {}).forEach((edgeId) => {
      const edge = this.edgeMetadata[edgeId];
      const a1 = this.getAuthor(edge.source), a2 = this.getAuthor(edge.target);
      this.getEdge(a1, a2);
    });

    for (const pub of this.publications) {
      const year = pub.year;
      const authors: Author[] = (pub.authors || []).map((a) => this.getAuthor(a));
      const edges = this.buildEdges(authors);

      const coauthors = {}; authors.forEach(a => coauthors[a.id] = true);
      for (const author of authors) {
        author.paperCount++;
        author.paperCountsByYear[year] = (author.paperCountsByYear[year] || 0) + 1;
        author.coauthorsByYear[year] = (author.coauthorsByYear[year] || {});

        pub.authors.forEach((authorId) => {
          author.coauthors[authorId] = true;
          author.coauthorsByYear[year][authorId] = true;
        });
      }
      for (const edge of edges) {
        edge.count++;
        edge.countsByYear[year] = (edge.countsByYear[year] || 0) + 1;
      }
    }
    this.authors.sort((a, b) => b.paperCount - a.paperCount);
    for (const author of this.authors) {
      author.coauthorCount = 0;
      for (const _ in author.coauthors) {
        if (true) {
          author.coauthorCount++;
        }
      }
    }

    this.authors.forEach(a => this.authorStats.count(a));
    this.coauthorEdges.forEach(e => this.coauthorEdgeStats.count(e));
  }

  getEdges(authors: Author[]): CoAuthorEdge[] {
    const seen: any = {};
    for (const a of authors) { seen[a.id] = true; }
    return this.coauthorEdges.filter(e => seen[e.author1.id] && seen[e.author2.id]);
  }
  getAuthor(id: string): Author {
    let author: Author = this.id2author[id];
    if (!author) {
      author = this.id2author[id] = new Author(Object.assign({
        id,
        paperCount: 0,
        paperCountsByYear: {},

        coauthorCount: 0,
        coauthors: {},
        coauthorsByYear: {},

        globalStats: this.authorStats
      }, this.authorMetadata[id]));
      this.authors.push(author);
    }
    return author;
  }
  private getEdgeId(a1: Author, a2: Author): string {
    return a1.id < a2.id ? `${a1.id}|${a2.id}` : `${a2.id}|${a1.id}`;
  }
  private buildEdges(authors: Author[]): CoAuthorEdge[] {
    const seen: any = {};
    const edges: CoAuthorEdge[] = [];
    authors.forEach((a1) => {
      authors.forEach((a2) => {
        if (a1.id !== a2.id) {
          const edgeId = this.getEdgeId(a1, a2);
          if (!seen[edgeId]) {
            seen[edgeId] = true;
            edges.push(this.getEdge(a1, a2));
          }
        }
      });
    });
    return edges.filter(e => !!e);
  }
  private getEdge(author1: Author, author2: Author): CoAuthorEdge {
    const id = this.getEdgeId(author1, author2);
    let edge: CoAuthorEdge = this.id2edge[id];
    if (!edge && this.edgeMetadata && this.edgeMetadata.hasOwnProperty(id)) {
      edge = this.id2edge[id] = new CoAuthorEdge(Object.assign({},
        this.edgeMetadata[id],
        {
          author1,
          author2,

          count: 0,
          countsByYear: {},

          globalStats: this.coauthorEdgeStats
        }
      ));
      this.coauthorEdges.push(edge);
    } else if (!edge && !this.edgeMetadata) {
      edge = this.id2edge[id] = new CoAuthorEdge({
        id,
        source: author1.id,
        target: author2.id,
        author1,
        author2,

        count: 0,
        countsByYear: {},

        globalStats: this.coauthorEdgeStats
      });
      this.coauthorEdges.push(edge);
    }
    return edge;
  }
}
