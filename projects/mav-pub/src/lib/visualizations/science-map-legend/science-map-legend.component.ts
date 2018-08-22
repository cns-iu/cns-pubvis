import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs';

import { BoundField } from '@ngx-dino/core';
import { SubdisciplineWeight } from '../shared/subdiscipline-weight';
import { Filter } from '../shared/filter';

import { subdisciplineSizeField } from '../shared/science-map/science-map-fields';
import { ScienceMapDataService } from '../shared/science-map/science-map-data.service';

@Component({
  selector: 'app-science-map-legend',
  templateUrl: './science-map-legend.component.html',
  styleUrls: ['./science-map-legend.component.sass']
})
export class ScienceMapLegendComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  subdisciplineSize: BoundField<number>;

  filteredSubdisciplines: Observable<SubdisciplineWeight[]>;
  unmappedSubdisciplines: Observable<SubdisciplineWeight>;

  nodeSizeEncoding = '# Fractionally Assigned Papers';

  constructor(private dataService: ScienceMapDataService) {
    this.filteredSubdisciplines = dataService.mappedSubdisciplines.asObservable();
    this.unmappedSubdisciplines = dataService.unmappedSubdisciplines.asObservable();
 }

  ngOnInit() {
    this.subdisciplineSize = subdisciplineSizeField.getBoundField('size');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      this.dataService.fetchData(this.filter).subscribe(undefined, undefined,
        () => this.filterUpdateComplete.emit(true)
      );
    }
  }
}