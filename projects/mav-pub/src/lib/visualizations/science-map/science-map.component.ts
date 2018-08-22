import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { BoundField } from '@ngx-dino/core';

import { Observable } from 'rxjs';

import { ScienceMapDataService } from '../shared/science-map/science-map-data.service';

import { Filter } from '../shared/filter';
import { SubdisciplineWeight } from '../shared/subdiscipline-weight';
import { subdisciplineSizeField, subdisciplineIDField } from '../shared/science-map/science-map-fields';

@Component({
  selector: 'app-science-map',
  templateUrl: './science-map.component.html',
  styleUrls: ['./science-map.component.sass']
})
export class ScienceMapComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() width: number;
  @Input() height: number;
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  subdisciplineSize: BoundField<number>;
  subdisciplineID: BoundField<number|string>;
  filteredSubdisciplines: Observable<SubdisciplineWeight[]>;

  constructor(private dataService: ScienceMapDataService) { 
    this.filteredSubdisciplines = this.dataService.filteredSubdisciplines.asObservable();
  }

  ngOnInit() { 
     // not user facing
     this.subdisciplineSize = subdisciplineSizeField.getBoundField('size');
     this.subdisciplineID = subdisciplineIDField.getBoundField('id');
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('filter' in changes) {
      const filter: Partial<Filter> = Object.assign({}, this.filter);
      this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
        this.filterUpdateComplete.emit(true);
      });
    }
  }

}
