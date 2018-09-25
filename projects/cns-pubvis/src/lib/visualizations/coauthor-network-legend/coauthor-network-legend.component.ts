import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { Observable, of } from 'rxjs';

import * as d3Selection from 'd3-selection';
import * as d3Array from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { BoundField, RawChangeSet, access, simpleField } from '@ngx-dino/core';

import { Author, CoAuthorEdge } from '../../shared/author';
import { Filter } from '../../shared/filter';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';

@Component({
  selector: 'cns-pubvis-coauthor-network-legend',
  templateUrl: './coauthor-network-legend.component.html',
  styleUrls: ['./coauthor-network-legend.component.scss']
})
export class CoauthorNetworkLegendComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() numCoAuthors = 0;
  @Input() edgeSizeRange: number[];
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  nodeStream: Observable<RawChangeSet<any>>;
  edgeStream: Observable<RawChangeSet<any>>;

  colorLegendEncoding: string;
  edgeLegendEncoding: string;

  gradient: string;

  constructor(private dataService: CoauthorNetworkDataService) {
    this.dataService.nodeStream.subscribe(e => this.nodeStream = of(e));
    this.dataService.edgeStream.subscribe(e => this.edgeStream = of(e));

    this.edgeSizeRange = this.dataService.edgeSizeRange;
  }

  accessor<T = any>(field: string): BoundField<T> {
    return simpleField<T>({
      bfieldId: field, label: field, operator: access(field)
    }).getBoundField(field);
  }

  ngOnInit() {
    this.colorLegendEncoding = this.dataService.colorLegendEncoding;
    this.edgeLegendEncoding = this.dataService.edgeLegendEncoding;
    this.gradient = this.dataService.nodeColorRange.toString();
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (('filter' in changes) && this.filter) {
    //   const filter: Partial<Filter> = Object.assign({}, this.filter, {limit: this.numCoAuthors});
    //   this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
    //     this.filterUpdateComplete.emit(true);
    //   });
    // }
  }
}
