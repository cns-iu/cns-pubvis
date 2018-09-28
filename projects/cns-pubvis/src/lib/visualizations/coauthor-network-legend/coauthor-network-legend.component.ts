import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { Observable, of } from 'rxjs';

import { BoundField, RawChangeSet, access, simpleField } from '@ngx-dino/core';

import { Filter } from '../../shared/filter';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';
import { colorRange, strokeSizeRange, radiusSizeRange } from '../../encoding';

@Component({
  selector: 'cns-pubvis-coauthor-network-legend',
  templateUrl: './coauthor-network-legend.component.html',
  styleUrls: ['./coauthor-network-legend.component.scss']
})
export class CoauthorNetworkLegendComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() numCoAuthors = 0;
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  nodeStream: Observable<RawChangeSet<any>>;
  edgeStream: Observable<RawChangeSet<any>>;

  edgeSizeRange: number[] = strokeSizeRange;
  nodeColorRange = colorRange;
  nodeSizeRange = radiusSizeRange;

  readonly nodeFields: any = {};
  readonly edgeFields: any = {};

  constructor(private dataService: CoauthorNetworkDataService) {
    this.dataService.nodeStream.subscribe(e => this.nodeStream = of(e));
    this.dataService.edgeStream.subscribe(e => this.edgeStream = of(e));

    ['id', 'coauthorCount', 'paperCount'].forEach(path => this.nodeFields[path] = this.accessor(path));
    ['id', 'count'].forEach(path => this.edgeFields[path] = this.accessor(path));
  }

  accessor<T = any>(field: string): BoundField<T> {
    return simpleField<T>({
      bfieldId: field, label: field, operator: access(field)
    }).getBoundField(field);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      const filter: Partial<Filter> = Object.assign({}, this.filter, {limit: this.numCoAuthors});
      this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
        this.filterUpdateComplete.emit(true);
      });
    }
  }
}
