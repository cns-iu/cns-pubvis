import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BoundField, RawChangeSet } from '@ngx-dino/core';

import { Filter } from '../../shared/filter';
import { SubdisciplineWeight } from '../../shared/subdiscipline-weight';
import { ScienceMapDataService } from '../shared/science-map/science-map-data.service';
import { subdisciplineIdField, subdisciplineSizeField } from '../shared/science-map/science-map-fields';

@Component({
  selector: 'cns-pubvis-science-map-legend',
  templateUrl: './science-map-legend.component.html',
  styleUrls: ['./science-map-legend.component.scss'],
  providers: [ScienceMapDataService]
})
export class ScienceMapLegendComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  filteredSubdisciplines: Observable<RawChangeSet<any>>;
  unmappedSubdisciplines: SubdisciplineWeight;
  subdisciplineSize: BoundField<number>;
  subdisciplineId: BoundField<number | string>;
  nodeLabelToColor: any;

  constructor(private dataService: ScienceMapDataService) {
    this.dataService.filteredSubdisciplines.asObservable().subscribe((changes) => {
      this.filteredSubdisciplines = of(changes);
    });
    dataService.unmappedSubdisciplines.asObservable().subscribe(s => this.unmappedSubdisciplines = s);
  }

  ngOnInit() {
    this.subdisciplineSize = subdisciplineSizeField.getBoundField();
    this.subdisciplineId = subdisciplineIdField.getBoundField();
    this.nodeLabelToColor = [
      {label: 'Health Professionals', color: '#D36E44'},
      {label: 'Medical Specialties', color: '#D30706'},
      {label: 'Chemistry', color: '#0707D2'},
      {label: 'Math & Physics', color: '#8E1BCE'},
      {label: 'Elec. Eng. & Comp. Sci.', color: '#D372D2'},
      {label: 'Chem. Mech. & Civil Eng.', color: '#55D4D2'},
      {label: 'Infectious Diseases', color: '#8D1B18'},
      {label: 'Biology', color: '#33820D'},
      {label: 'Biotechnology', color: '#07D46D'},
      {label: 'Humanities', color: '#D3D46D'},
      {label: 'Social Sciences', color: '#D3D406'},
      {label: 'Brain Research', color: '#D39827'},
      {label: 'Earth Sciences', color: '#9B180F'},
      {label: 'Multidisciplinary', color: '#000000'},
      {label: 'Unclassified', color: '#AAAAAA'}
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      this.dataService.fetchData(this.filter).subscribe({ complete: () =>
        this.filterUpdateComplete.emit(true)
      });
    }
  }
}
