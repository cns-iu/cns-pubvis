import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { access, BoundField, DataType, simpleField, RawChangeSet } from '@ngx-dino/core';
import { get } from 'lodash';
import { ReplaySubject, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DatabaseService } from '../shared/database.service';
import { Filter } from '../shared/filter';


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
    if (s1 && s2) {
      return s1.localeCompare(s2);
    } else if (!s1 && !s2) {
      return 0;
    } else if (!s1) {
      return -1;
    } else {
      return 1;
    }
  };
}

@Component({
  selector: 'cns-pubvis-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter>;
  private filterEvents = new ReplaySubject<Partial<Filter>>(1);

  authors: Observable<RawChangeSet>;
  authorIdField = createFields([['id']])[0];
  authorFields = createFields([
    ['label', 'Author', DataType.String],
    ['paperCount', '# Publications', DataType.Number]
  ]);
  authorSort = createStringCompare('0'); // YUCK.

  constructor(private database: DatabaseService) { }

  ngOnInit(): void {
    this.filterEvents.pipe(
      switchMap(f => this.database.getAuthors(f)),
      map(authors => authors.filter(a => a.show_label))
    ).subscribe((authors) =>
      this.authors = of(RawChangeSet.fromArray(authors))
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('filter' in changes) {
      this.filterEvents.next(this.filter);
    }
  }
}
