import { Injectable } from '@angular/core';

import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { RawChangeSet } from '@ngx-dino/core';

import { Filter } from '../../../shared/filter';

import { Author, CoAuthorEdge, CoAuthorGraph } from '../../../shared/author';
import { DatabaseService } from '../../../shared/database.service';

export const DEFAULT_FILTER: Partial<Filter> = {year: {start: 2002, end: 2017}};

@Injectable()
export class CoauthorNetworkDataService {
  private dataSubscription: Subscription;

  filteredGraph = new BehaviorSubject<CoAuthorGraph>({authors: [], coauthorEdges: []});
  filteredAuthors = new BehaviorSubject<Author[]>([]);
  filteredCoauthors = new BehaviorSubject<CoAuthorEdge[]>([]);

  private nodesChange = new BehaviorSubject<RawChangeSet<Author>>(new RawChangeSet());
  public nodeStream = this.nodesChange.asObservable();

  private edgesChange = new BehaviorSubject<RawChangeSet<CoAuthorEdge>>(new RawChangeSet());
  public edgeStream = this.edgesChange.asObservable();

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
    this.dataSubscription = graph.subscribe((g) => {
        this.filteredGraph.next(g);
        this.filteredAuthors.next(g.authors);
        this.filteredCoauthors.next(g.coauthorEdges);
        this.nodesChange.next(RawChangeSet.fromArray(g.authors));
        this.edgesChange.next(RawChangeSet.fromArray(g.coauthorEdges));
      }
    );
    return graph;
  }
}
