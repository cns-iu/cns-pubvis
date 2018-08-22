
export interface Author {
  id: string;
  paperCount: number;
  paperCountsByYear: { [year: number] : number };

  coauthorCount: number;
  coauthors: { [authorId: string] : boolean };
  coauthorsByYear: { [year: number] : { [authorId: string] : boolean } };

  xpos?: number;
  ypos?: number;
}

export interface CoAuthorEdge {
  id: string;
  source: string;
  target: string;

  author1: Author;
  author2: Author;

  count: number;
  countsByYear: { [year: number] : number };
}

export interface CoAuthorGraph {
  authors: Author[],
  coauthorEdges: CoAuthorEdge[]
}
