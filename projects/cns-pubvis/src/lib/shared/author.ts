import { access, chain, combine, constant, map, Operand } from '@ngx-dino/core';

import {
  areaSizeLogScaleNormQuantitative,
  areaSizeScaleNormQuantitative,
  colorScaleNormQuantitative,
  colorScaleNormQuantitativeStroke,
  fontSizeScaleNormQuantitative,
  formatFullname,
  formatNumber,
  greyScaleNormQuantitative,
  greyScaleNormQuantitativeStroke,
  norm0to100,
  strokeSizeScaleNormQuantitative,
} from '../encoding';

export class AuthorStats {
  paperCountMax = 0;
  coauthorCountMax = 0;

  count(item: Author) {
    this.paperCountMax = Math.max(this.paperCountMax, item.paperCount);
    this.coauthorCountMax = Math.max(this.coauthorCountMax, item.coauthorCount);
  }
}

// @dynamic
export class Author {
  id: string;
  fullname: string;
  paperCount: number;
  paperCountsByYear: { [year: number]: number };

  coauthorCount: number;
  coauthors: { [authorId: string]: boolean };
  coauthorsByYear: { [year: number]: { [authorId: string]: boolean } };

  hasHighlightedAffiliation: boolean;
  affiliationsByYear: { [year: number]: { [affiliation: string]: boolean } };

  xpos?: number;
  ypos?: number;

  globalStats: AuthorStats;

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Operand<number>(access('paperCountAreaSize'), false)
  areaSize: number;
  @Operand<string>(access('coauthorCountColor'), false)
  color: string;
  @Operand<string>(map<any, string>(a => a.show_label ? 'black' : a.coauthorCountStrokeColor), false)
  strokeColor: string;
  @Operand<[number, number]>(combine([access('xpos'), access('ypos')]), true)
  position: [number, number];
  @Operand<string>(chain(access('hasHighlightedAffiliation'), map(highlight => highlight ? 'circle' : 'triangle')), true)
  symbol: string;
  @Operand<number>(chain(
    access<number>('areaSize'),
    map(s => Math.sqrt(s) / 2),
    map(r => 0.1 * r)
  ), false)
  strokeWidth: number;
  @Operand<string>(access('label'), true)
  tooltip: string;
  @Operand<string>(chain(
    map<any, string>(s => s.fullname || s.id || ''),
    formatFullname
  ), true)
  label: string;
  @Operand<string>(map<any, string>(s => s.show_label ? 'right' : ''), true)
  labelPosition: string;

  @Operand<number>(norm0to100('paperCount', 'globalStats.paperCountMax'), false)
  paperCountNorm: number;
  @Operand<string>(chain(access('paperCount'), formatNumber), false)
  paperCountLabel: string;
  @Operand<number>(chain(access('paperCountNorm'), areaSizeLogScaleNormQuantitative), false)
  paperCountAreaSize: number;
  @Operand<number>(chain(access('paperCountNorm'), fontSizeScaleNormQuantitative), false)
  paperCountFontSize: number;
  @Operand<string>(chain(access('paperCountNorm'), colorScaleNormQuantitative), false)
  paperCountColor: string;
  @Operand<string>(chain(access('paperCountNorm'), colorScaleNormQuantitativeStroke), false)
  paperCountStrokeColor: string;

  @Operand<number>(norm0to100('coauthorCount', 'globalStats.coauthorCountMax'), false)
  coauthorCountNorm: number;
  @Operand<string>(chain(access('coauthorCount'), formatNumber), false)
  coauthorCountLabel: string;
  @Operand<number>(chain(access('coauthorCountNorm'), areaSizeScaleNormQuantitative), false)
  coauthorCountAreaSize: number;
  @Operand<number>(chain(access('coauthorCountNorm'), fontSizeScaleNormQuantitative), false)
  coauthorCountFontSize: number;
  @Operand<string>(chain(access('coauthorCountNorm'), colorScaleNormQuantitative), false)
  coauthorCountColor: string;
  @Operand<string>(chain(access('coauthorCountNorm'), colorScaleNormQuantitativeStroke), false)
  coauthorCountStrokeColor: string;
}

export class CoAuthorEdgeStats {
  countMax = 0;

  count(item: CoAuthorEdge) {
    this.countMax = Math.max(this.countMax, item.count);
  }
}


// @dynamic
export class CoAuthorEdge {
  id: string;
  source: string;
  target: string;

  author1: Author;
  author2: Author;

  count: number;
  countsByYear: { [year: number]: number };

  globalStats: CoAuthorEdgeStats;

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Operand<[number, number]>(chain(
    access('author1'),
    combine([access('xpos'), access('ypos')])
  ), true)
  sourcePosition: [number, number];
  @Operand<[number, number]>(chain(
    access('author2'),
    combine([access('xpos'), access('ypos')])
  ), true)
  targetPosition: [number, number];
  @Operand<string>(constant('#d7d7d7'), true)
  color: string;
  @Operand<number>(access('countStrokeSize'), false)
  strokeWidth: number;


  @Operand<number>(norm0to100('count', 'globalStats.countMax'), false)
  countNorm: number;
  @Operand<string>(chain(access('count'), formatNumber), false)
  countLabel: string;
  @Operand<number>(chain(access('countNorm'), areaSizeScaleNormQuantitative), false)
  countAreaSize: number;
  @Operand<number>(chain(access('countNorm'), strokeSizeScaleNormQuantitative), false)
  countStrokeSize: number;
  @Operand<number>(chain(access('countNorm'), fontSizeScaleNormQuantitative), false)
  countFontSize: number;
  @Operand<string>(chain(access('countNorm'), greyScaleNormQuantitative), false)
  countColor: string;
  @Operand<string>(chain(access('countNorm'), greyScaleNormQuantitativeStroke), false)
  countStrokeColor: string;
}

export interface CoAuthorGraph {
  authors: Author[];
  coauthorEdges: CoAuthorEdge[];
}
