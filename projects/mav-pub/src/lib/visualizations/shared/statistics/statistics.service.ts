import { Injectable, EventEmitter } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { Map, Set } from 'immutable';

import { Filter } from '../filter';
import { Author, CoAuthorEdge } from '../author';
import { Publication } from '../publication';
import { DatabaseService } from '../database.service';
import { Statistics } from './statistics';


type DataTuple = [Author[], CoAuthorEdge[], Publication[]];

@Injectable()
export class StatisticsService {
  private subscriptions: Subscription[] = [];

  readonly statistics = new EventEmitter<Statistics>();

  constructor(private service: DatabaseService) { }

  fetchData(filter: Partial<Filter> = {}): void {
    this.clearSubscriptions();

    const dataObservables = [];
    dataObservables.push(this.service.getCoAuthorGraph(filter));
    dataObservables.push(this.service.getPublications(filter));

    this.subscriptions.push(
      combineLatest(dataObservables, (graph, pubs) => {
        return [graph.authors, graph.coauthorEdges, pubs];
      }).subscribe((data: DataTuple) => {
        this.statistics.emit(this.collectStatistics(data));
      })
    );
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  private collectStatistics(
    [authors, coauthorsEdges, publications]: DataTuple
  ): Statistics {
    const result = {} as Statistics;

    // General statistics
    result.nPublications = publications.length;
    result.nAuthors = authors.length;

    result.avgAuthorsPerPublication = publications.reduce((sum, pub) => {
      return sum + pub.authors.length;
    }, 0) / publications.length;

    // Network statistics
    const coauthorDegreeCounts = Map<string, number>().withMutations((map) => {
      coauthorsEdges.forEach((edge) => {
        map.updateIn([edge.author1.id], (count = 0) => count + 1);
        map.updateIn([edge.author2.id], (count = 0) => count + 1);
      });
    });

    result.avgDegree = coauthorDegreeCounts
      .reduce((sum, count) => sum + count, 0) / coauthorDegreeCounts.size;

    result.maxDegree = coauthorDegreeCounts
      .reduce((max, count) => Math.max(max, count), 0);

    // nAuthorsByYear
    const authorsByYear = Map<number, Set<string>>().withMutations((map) => {
      publications.forEach((pub) => {
        map.updateIn([pub.year], (set: Set<String> = Set()) => {
          return set.union(pub.authors);
        });
      });
    });

    result.nAuthorsByYear = authorsByYear.entrySeq()
      .map(([year, set]) => ({year, count: set.size})).toArray()
      .sort((a, b) => b.year - a.year);

    // nPublicationsByYear
    const publicationsByYear = Map<number, Set<number>>().withMutations((map) => {
      publications.forEach((pub) => {
        map.updateIn([pub.year], (set: Set<number> = Set()) => {
          return set.add(pub.id);
        });
      });
    });

    result.nPublicationsByYear = publicationsByYear.entrySeq()
      .map(([year, set]) => ({year, count: set.size})).toArray()
      .sort((a, b) => b.year - a.year);

    return result;
  }
}
