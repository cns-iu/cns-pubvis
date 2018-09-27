import { Injectable } from '@angular/core';

import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { RawChangeSet } from '@ngx-dino/core';

import { Filter } from '../../../shared/filter';
import { colorRange } from '../../../encoding';

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
  nodeColorRange = colorRange;
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
        // An apology and explanation: Sorry.
        // We call getAuthors after getCoAuthorGraph, because the filter mutates
        // _all_ authors to have paperCount/coauthorCount based on that filter.
        // the normal getCoAuthorGraph function just returns the matched authors.
        // this shows all authors even if they have a zero count.
        // FIXME: This code/method should be replaced with something much cleaner.
        this.databaseService.getAuthors({year: null}).subscribe(authors => {
          this.nodesChange.next(RawChangeSet.fromArray(authors));
          this.edgesChange.next(RawChangeSet.fromArray(g.coauthorEdges));
        });
      }
    );
    return graph;
  }
}
