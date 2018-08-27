import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BoundField, RawChangeSet } from '@ngx-dino/core';

import { ScienceMapDataService } from '../shared/science-map/science-map-data.service';
import { Filter } from '../../shared/filter';
import { SubdisciplineWeight } from '../../shared/subdiscipline-weight';
import { subdisciplineSizeField, subdisciplineIdField } from '../shared/science-map/science-map-fields';

@Component({
  selector: 'cns-pubvis-science-map',
  templateUrl: './science-map.component.html',
  styleUrls: ['./science-map.component.sass']
})
export class ScienceMapComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() width = 0;
  @Input() height = 0;
  @Output() filterUpdateComplete = new EventEmitter<boolean>();
  @ViewChild('scienceMap') scienceMap: any;

  subdisciplineSize: BoundField<number>;
  subdisciplineID: BoundField<number|string>;
  filteredSubdisciplines: Observable<RawChangeSet<SubdisciplineWeight>>;

  constructor(private dataService: ScienceMapDataService) {
    this.dataService.filteredSubdisciplines.asObservable().subscribe((changes) => {
      this.filteredSubdisciplines = of(changes);
    });
  }

  ngOnInit() {
     // not user facing
     this.subdisciplineSize = subdisciplineSizeField.getBoundField('size');
     this.subdisciplineID = subdisciplineIdField.getBoundField('id');
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('filter' in changes) {
      const filter: Partial<Filter> = Object.assign({}, this.filter);
      this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
        this.filterUpdateComplete.emit(true);
      });
    }
  }

  activate(): void {
    this.scienceMap.resizeSelf();
  }
}
