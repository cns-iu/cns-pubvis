import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { access, BoundField, chain, map, RawChangeSet, simpleField } from '@ngx-dino/core';
import { Observable, of } from 'rxjs';

import { DatabaseService } from '../../shared/database.service';
import { Filter } from '../../shared/filter';
import { Publication } from '../../shared/publication';
import { SubdisciplineWeight } from '../../shared/subdiscipline-weight';
import { ScienceMapDataService } from '../shared/science-map/science-map-data.service';
import { subdisciplineIdField, subdisciplineSizeField } from '../shared/science-map/science-map-fields';

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

  subdisciplineSize: BoundField<number>;
  subdisciplineID: BoundField<number|string>;
  filteredSubdisciplines: Observable<RawChangeSet<SubdisciplineWeight>>;

  fullTableData: Publication[] = [];
  tableData: { name: string, count: number }[] = [];
  tableFields: BoundField<any>[] = [];

  sort = (a: any, b: any) => Number(b.content) - Number(a.content);

  constructor(
    private database: DatabaseService,
    private dataService: ScienceMapDataService
  ) {
    this.dataService.filteredSubdisciplines.asObservable().subscribe((changes) => {
      this.filteredSubdisciplines = of(changes);
    });

    [
      ['Name', 'name'], ['#Publications', 'count']
    ].forEach(([label, path]) => this.tableFields.push(this.makeTableAccessor(label, path)));
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
      this.filterTableData();
    }
  }

  makeTableAccessor(label: string, path: string): BoundField<any> {
    return simpleField({
      bfieldId: label, label,
      operator: chain(access(path), map(s => ({ type: 'text', content: s })))
    }).getBoundField();
  }

  setTableData(subdiscipline: SubdisciplineWeight): void {
    this.fullTableData = this.database.findPublicationsForSubdiscipline(subdiscipline);
    this.filterTableData();
  }

  filterTableData(): void {
    let pubs = this.fullTableData;
    if (this.filter.year) {
      const { start, end } = this.filter.year;
      pubs = pubs.filter(pub => start <= pub.year && pub.year <= end);
    }

    const counts: { [key: string]: number } = {};
    pubs.forEach(pub => pub.authors.forEach(author => {
      counts[author] = (counts[author] || 0) + 1;
    }));
    

    this.tableData = [];
    for (const name in counts) {
      if (counts.hasOwnProperty(name)) {
        this.tableData.push({ name, count: counts[name] });
      }
    }
  }
}
