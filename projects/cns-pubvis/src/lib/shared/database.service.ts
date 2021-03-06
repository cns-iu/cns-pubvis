import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { Filter } from './filter';
import { Publication } from './publication';
import { Author, CoAuthorEdge, CoAuthorGraph } from './author';
import { SubdisciplineWeight } from './subdiscipline-weight';

import { MavPubDatabase } from './mavpub-database';

function sumAgg<T>(items: T[], itemKeyField: string, keyField: string, valueField: string): {[key: string]: number} {
  const acc: any = {};
  for (const innerItem of items) {
    for (const item of innerItem[itemKeyField]) {
      const key = item[keyField];
      const weight = item[valueField];
      if (acc.hasOwnProperty(key)) {
        acc[key] += weight;
      } else {
        acc[key] = weight;
      }
    }
  }
  return acc;
}

@Injectable()
export class DatabaseService {
  private db: MavPubDatabase;

  constructor() { }

  setDatabase(database: MavPubDatabase) {
    this.db = database;
  }

  getAuthors(filter: Partial<Filter> = {}): Observable<Author[]> {
    return of(this.db.authors).pipe(map((authors) => {
      return this.filterAuthors(filter);
    }), delay(1));
  }
  private filterAuthors(filter: Partial<Filter> = {}): Author[] {
    let filtered = this.db.authors;
    if (filter.year) {
      const years = [];
      for (let yr = filter.year.start; yr <= filter.year.end; yr++) {
        years.push(yr);
      }
      filtered.forEach((a) => {
        a.paperCount = years.reduce((acc, y) => (a.paperCountsByYear[y] || 0) + acc, 0);
        a.coauthorCount = 0;
        if (a.paperCount > 0) {
          const coauthors = {};
          let coauthorCount = 0;
          for (const yr of years) {
            for (const authorId of Object.keys(a.coauthorsByYear[yr] || {})) {
              if (a.id !== authorId && !coauthors[authorId]) {
                coauthors[authorId] = true;
                coauthorCount++;
              }
            }
          }
          a.coauthorCount = coauthorCount;
        }

        a.hasHighlightedAffiliation = false;
        const toHighlight = this.db.highlightedAffiliations;
        for (const y of years) {
          for (const aff of Object.keys(a.affiliationsByYear[y] || {})) {
            for (const highlight of toHighlight) {
              if (aff.indexOf(highlight) !== -1) {
                a.hasHighlightedAffiliation = true;
              }
            }
          }
        }
      });
      filtered = filtered.filter(a => a.paperCount > 0);
    }
    if (filter.limit && filter.limit > 0) {
      filtered.sort((a, b) => b.paperCount - a.paperCount);
      filtered = filtered.slice(0, filter.limit);
    }
    return filtered;
  }

  getCoAuthorEdges(filter: Partial<Filter> = {}): Observable<CoAuthorEdge[]> {
    return this.getCoAuthorGraph(filter).pipe(map((graph) => graph.coauthorEdges));
  }

  getCoAuthorGraph(filter: Partial<Filter> = {}): Observable<CoAuthorGraph> {
    const all: CoAuthorGraph = {
      authors: this.db.authors,
      coauthorEdges: this.db.coauthorEdges
    };
    return of(all).pipe(map((a) => {
        const authors = this.filterAuthors(filter);
        if (authors.length === a.authors.length) {
          return a;
        } else {
          let edges = this.db.coauthorNetwork.getEdges(authors);
          if (filter.year) {
            const years = [];
            for (let yr = filter.year.start; yr <= filter.year.end; yr++) {
              years.push(yr);
            }
            edges.forEach((e) => {
              e.count = years.reduce((acc, y) => (e.countsByYear[y] || 0) + acc, 0);
            });
          }
          // edges.sort((a1, a2) => a2.count - a1.count);
          edges = edges.filter(e => e.count > 0);
          return {authors, coauthorEdges: edges};
        }
      }), delay(1));
  }

  getPublications(filter: Partial<Filter> = {}): Observable<Publication[]> {
    if (filter.year) {
      const filteredPublications = this.db.publications.filter((pubs: any) => {
        return (pubs.year >= filter.year.start && pubs.year <= filter.year.end) ? pubs : null;
      });
      return of(filteredPublications);
    } else {
      return of(this.db.publications);
    }
  }

  getSubdisciplines(filter: Partial<Filter> = {}): Observable<SubdisciplineWeight[]> {
    return this.getPublications(filter).pipe(map((publications) => {
      const weights = sumAgg<Publication>(publications, 'subdisciplines', 'subd_id', 'weight');
      const results: SubdisciplineWeight[] = [];
      for (let subd_id = -1; subd_id < 555; subd_id++) {
        weights[subd_id] = weights[subd_id] || 0.0001;
      }
      for (const subd_id of Object.keys(weights)) {
        results.push({subd_id: Number(subd_id), weight: weights[subd_id]});
      }
      return results;
    }), delay(1));
  }

  getDistinct(fieldName: string, filter: Partial<Filter> = {}): Observable<string[]> {
    return this.getPublications(filter).pipe(map((publications) => {
      const seen: any = {};
      const values: string[] = [];
      for (const pub of publications) {
        const value = pub[fieldName];
        if (!seen.hasOwnProperty(value)) {
          seen[value] = true;
          values.push(value);
        }
      }
      return values;
    }));
  }

  findPublicationsForAuthor(author: Author): Publication[] {
    return this.db.publications.filter(pub => pub.authors.indexOf(author.id) >= 0);
  }

  findPublicationsForSubdiscipline(subdiscipline: SubdisciplineWeight): Publication[] {
    return this.db.publications.filter(pub => pub.subdisciplines.find(sub => sub.subd_id === Number(subdiscipline.subd_id)));
  }
}
