import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output
} from '@angular/core';

import { Observable } from 'rxjs';

import * as d3Selection from 'd3-selection';
import * as d3Array from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { BoundField, RawChangeSet } from '@ngx-dino/core';

import { Author, CoAuthorEdge } from '../../shared/author';
import { Filter } from '../../shared/filter';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';
import {
  nodeIdField,
  nodeSizeField,
  nodeColorField,

  edgeIdField,
  edgeSizeField,
} from '../shared/coauthor-network/coauthor-network-fields';

@Component({
  selector: 'cns-pubvis-coauthor-network-legend',
  templateUrl: './coauthor-network-legend.component.html',
  styleUrls: ['./coauthor-network-legend.component.scss']
})
export class CoauthorNetworkLegendComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() numCoAuthors = 50;
  @Input() edgeSizeRange: number[];
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  nodeStream: Observable<RawChangeSet<any>>;
  edgeStream: Observable<RawChangeSet<any>>;

  nodeId: BoundField<string>;
  nodeSize: BoundField<number>;
  nodeColor: BoundField<number>;

  edgeId: BoundField<string>;
  edgeSize: BoundField<number>;

  colorLegendEncoding: string;
  edgeLegendEncoding: string;

  gradient: string;

  constructor(private dataService: CoauthorNetworkDataService) {
    this.nodeStream = this.dataService.nodeStream;
    this.edgeStream = this.dataService.edgeStream;

    this.edgeSizeRange = this.dataService.edgeSizeRange;
  }

  ngOnInit() {
    this.colorLegendEncoding = this.dataService.colorLegendEncoding;
    this.edgeLegendEncoding = this.dataService.edgeLegendEncoding;

    // not user facing
    this.nodeId = nodeIdField.getBoundField('id');
    this.nodeSize = nodeSizeField.getBoundField('size');
    this.nodeColor = nodeColorField.getBoundField('color');

    this.edgeId = edgeIdField.getBoundField('id');
    this.edgeSize = edgeSizeField.getBoundField('edgeSize');

    this.gradient = this.dataService.nodeColorRange.toString();
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
