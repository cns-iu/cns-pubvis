import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { Filter } from '../filter';

import { Author, CoAuthorEdge, CoAuthorGraph } from '../author';
import { DatabaseService } from '../database.service';

export const DEFAULT_FILTER: Partial<Filter> = {year: {start: 2002, end: 2017}};

@Injectable()
export class CoauthorNetworkDataService {
  private dataSubscription: Subscription;

  filteredGraph = new BehaviorSubject<CoAuthorGraph>({authors: [], coauthorEdges: []});
  filteredAuthors = new BehaviorSubject<Author[]>([]);
  filteredCoauthors = new BehaviorSubject<CoAuthorEdge[]>([]);

  // defaults
  nodeColorRange = ['#FDD3A1', '#E9583D', '#7F0000'];
  colorLegendEncoding = '# Co-Authors';
  edgeLegendEncoding = '# Co-Authored Publications';
  edgeSizeRange = [1, 8];

  constructor(private databaseService: DatabaseService) {
  }

  fetchData(filter: Partial<Filter> = {}): Observable<CoAuthorGraph> {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    const graph = this.databaseService.getCoAuthorGraph(filter);
    this.dataSubscription = graph.subscribe((graph) => {
        this.filteredGraph.next(graph);
        this.filteredAuthors.next(graph.authors);
        this.filteredCoauthors.next(graph.coauthorEdges);
      }
    );
    return graph;
  }
}
