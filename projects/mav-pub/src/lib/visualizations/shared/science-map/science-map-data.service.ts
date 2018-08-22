import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs';

import { Filter } from '../filter';
import { SubdisciplineWeight } from '../subdiscipline-weight';
import { DatabaseService } from '../database.service';

export const DEFAULT_FILTER: Partial<Filter> = {year: {start: 2002, end: 2017}};


@Injectable()
export class ScienceMapDataService {
  private dataSubscription: Subscription;

  filteredSubdisciplines = new BehaviorSubject<SubdisciplineWeight[]>([]);
  mappedSubdisciplines = new BehaviorSubject<SubdisciplineWeight[]>([]);
  unmappedSubdisciplines = new BehaviorSubject<SubdisciplineWeight>({subd_id: -1, weight: 0});

  constructor(private databaseService: DatabaseService) { }

  fetchData(filter: Partial<Filter> = {}) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    const subdiscs = this.databaseService.getSubdisciplines(filter);
    subdiscs.subscribe((s) => {
      const unmapped: any = s.filter((val) => val.subd_id == -1);
      const mapped: any = s.filter((val) => val.subd_id != -1);
      this.unmappedSubdisciplines.next(unmapped.shift());
      this.mappedSubdisciplines.next(mapped);
      this.filteredSubdisciplines.next(s);

    });

    return subdiscs;
  }
}
