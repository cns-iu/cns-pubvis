import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { access, BoundField, chain, constant, map, RawChangeSet, simpleField } from '@ngx-dino/core';
import { Observable, of } from 'rxjs';

import { Author } from '../../shared/author';
import { DatabaseService } from '../../shared/database.service';
import { Filter } from '../../shared/filter';
import { Publication } from '../../shared/publication';
import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';


@Component({
  selector: 'cns-pubvis-coauthor-network',
  templateUrl: './coauthor-network.component.html',
  styleUrls: ['./coauthor-network.component.sass']
})
export class CoauthorNetworkComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() numCoAuthors = 0;
  @Input() width = 0;
  @Input() height = 0;
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  nodeStream: Observable<RawChangeSet>;
  edgeStream: Observable<RawChangeSet>;
  fullTableData: Publication[] = [];
  tableData: Publication[] = [];
  tableTitle = '';

  readonly nodeFields: any = {};
  readonly edgeFields: any = {};
  readonly tableFields: any = [];

  sort = (a: any, b: any) => Number(b.content) - Number(a.content);

  constructor(
    private database: DatabaseService,
    private dataService: CoauthorNetworkDataService
  ) {
    this.dataService.nodeStream.subscribe(e => this.nodeStream = of(e));
    this.dataService.edgeStream.subscribe(e => this.edgeStream = of(e));

    [
      'id', 'position', 'symbol', 'color', 'areaSize', 'strokeColor',
      'strokeWidth', 'tooltip', 'label', 'labelPosition'
    ].forEach(path => this.nodeFields[path] = this.accessor(path));
    [
      'id', 'sourcePosition', 'targetPosition', 'color', 'strokeWidth'
    ].forEach(path => this.edgeFields[path] = this.accessor(path));

    [
      ['transparency', 0], ['strokeTransparency', 0], ['pulse', false]
    ].forEach(([label, value]: [string, any]) => this.nodeFields[label] = this.makeConstant(label, value));
    [
      ['transparency', 0]
    ].forEach(([label, value]: [string, any]) => this.edgeFields[label] = this.makeConstant(label, value));

    ([
      ['Authors', 'authors', chain(
        access('authors'),
        map((a: string[]) => a.join('; ')),
        map(s => ({ type: 'text', content: s }))
      )],
      ['Title', 'title'], ['Publication year', 'year'], ['Journal', 'journalName']
    ] as const).forEach(([label, path, op]) => this.tableFields.push(this.makeTableAccessor(label, path, op)));
  }

  accessor<T = any>(field: string): BoundField<T> {
    return simpleField<T>({
      bfieldId: field, label: field, operator: access(field)
    }).getBoundField(field);
  }

  makeConstant<T>(label: string, value: T): BoundField<T> {
    return simpleField<T>({ bfieldId: label, label, operator: constant(value) }).getBoundField(label);
  }

  makeTableAccessor(label: string, path: string, op?: any): BoundField<any> {
    return simpleField({
      bfieldId: label, label,
      operator: op || chain(access(path), map(s => ({ type: 'text', content: s })))
    }).getBoundField();
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      const filter: Partial<Filter> = Object.assign({}, this.filter, {limit: this.numCoAuthors});
      this.dataService.fetchData(filter).subscribe({ complete: () =>
        this.filterUpdateComplete.emit(true)
      });
      this.filterTableData();
    }
  }

  setTableData(author: Author): void {
    this.fullTableData = this.database.findPublicationsForAuthor(author);
    this.tableTitle = `${ author.fullname }'s Publications`;
    this.filterTableData();
  }

  filterTableData(): void {
    let data = this.fullTableData;
    if (this.filter.year) {
      const { start, end } = this.filter.year;
      data = data.filter(pub => start <= pub.year && pub.year <= end);
    }

    this.tableData = data;
  }
}
