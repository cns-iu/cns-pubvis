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

  fetchInitialData() {
    this.databaseService.getCoAuthorGraph().subscribe(g => {
      this.nodesChange.next(RawChangeSet.fromArray(g.authors));
      this.edgesChange.next(RawChangeSet.fromArray(g.coauthorEdges));
    });
  }

  fetchData(filter: Partial<Filter> = {}): Observable<CoAuthorGraph> {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    const graph = this.databaseService.getCoAuthorGraph(filter);
    this.dataSubscription = graph.subscribe((g) => {
        this.nodesChange.next(new RawChangeSet([], [], [], <any>g.authors.map(i => [i.id, i])));
        this.edgesChange.next(new RawChangeSet([], [], [], <any>g.coauthorEdges.map(i => [i.id, i])));
      }
    );
    return graph;
  }
}
