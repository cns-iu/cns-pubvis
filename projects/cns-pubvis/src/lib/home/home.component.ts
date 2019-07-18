import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { access, BoundField, DataType, simpleField } from '@ngx-dino/core';
import { get } from 'lodash';
import { map, switchMap } from 'rxjs/operators';

import { DatabaseService } from '../shared/database.service';
import { Filter } from '../shared/filter';
import { ReplaySubject } from 'rxjs';

function createFields(spec: [string, string?, DataType?][]): BoundField<any>[] {
  return spec.map(([path, label, type]) => {
    const args = {
      label: label || path,
      operator: access(path),
      dataType: type
    };
    const field = simpleField(args);
    return field.getBoundField();
  });
}

function createStringCompare(path: string): (o1: any, o2: any) => number {
  return (o1, o2) => {
    const s1: string = get(o1, path);
    const s2: string = get(o2, path);
    return s1.localeCompare(s2);
  };
}

@Component({
  selector: 'cns-pubvis-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnChanges {
  @Input() filter: Partial<Filter>;
  private filterEvents = new ReplaySubject<Partial<Filter>>(1);

  authors = this.filterEvents.pipe(
    switchMap(f => this.database.getAuthors(f)),
    map(authors => authors.filter(a => a.show_label))
  );
  authorIdField = createFields([['id']])[0];
  authorFields = createFields([
    ['label', 'PI', DataType.String],
    ['paperCount', '# Publications', DataType.Number]
  ]);
  authorSort = createStringCompare('id');

  constructor(private database: DatabaseService) { }

  ngOnChanges(changes: SimpleChanges) {
    if ('filter' in changes) {
      this.filterEvents.next(this.filter);
    }
  }
}
