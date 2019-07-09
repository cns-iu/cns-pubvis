import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BoundField, RawChangeSet, access, constant, simpleField } from '@ngx-dino/core';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';
import { Filter } from '../../shared/filter';


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

  readonly nodeFields: any = {};
  readonly edgeFields: any = {};

  constructor(private dataService: CoauthorNetworkDataService) {
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
  }

  accessor<T = any>(field: string): BoundField<T> {
    return simpleField<T>({
      bfieldId: field, label: field, operator: access(field)
    }).getBoundField(field);
  }

  makeConstant<T>(label: string, value: T): BoundField<T> {
    return simpleField<T>({ bfieldId: label, label, operator: constant(value) }).getBoundField(label);
  }

  ngOnInit() {
    this.dataService.fetchInitialData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      const filter: Partial<Filter> = Object.assign({}, this.filter, {limit: this.numCoAuthors});
      this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
        this.filterUpdateComplete.emit(true);
      });
    }
  }
}
