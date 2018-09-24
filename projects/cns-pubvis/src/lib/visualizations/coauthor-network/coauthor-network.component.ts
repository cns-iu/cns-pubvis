import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BoundField, RawChangeSet } from '@ngx-dino/core';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';
import { Filter } from '../../shared/filter';


import {
  nodeSizeField,
  nodeIdField,
  nodeColor2Field,
  nodePositionField,
  nodeSymbolField,
  nodeStrokeField,
  nodeStrokeWidthField,
  edgeIdField,
  edgeSourceField,
  edgeTargetField,
  edgeSizeField,
  edgeStroke,
  edgeStrokeWidth
} from '../shared/coauthor-network/coauthor-network-fields';

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

  nodeId: BoundField<string>;
  nodeSize: BoundField<number>;
  nodeColor: BoundField<string>;
  nodePosition: BoundField<[number, number]>;
  nodeSymbol: BoundField<string>;
  nodeStroke: BoundField<string>;
  nodeStrokeWidth: BoundField<number>;

  edgeId: BoundField<string>;
  edgeSource: BoundField<[number, number]>;
  edgeTarget: BoundField<[number, number]>;
  edgeSize: BoundField<number>;
  edgeStroke: BoundField<string>;
  edgeStrokeWidth: BoundField<number>;

  nodeColorRange: string[];

  visChargeStrength = -400;

  constructor(private dataService: CoauthorNetworkDataService) {
    this.nodeStream = this.dataService.nodeStream;
    this.edgeStream = this.dataService.edgeStream;
  }

  ngOnInit() {
    this.dataService.fetchInitialData();

    this.nodeId = nodeIdField.getBoundField('id');
    this.nodeSize = nodeSizeField.getBoundField('size');
    this.nodeColor = nodeColor2Field.getBoundField('color');
    this.nodePosition = nodePositionField.getBoundField('position');
    this.nodeSymbol = nodeSymbolField.getBoundField('symbol');
    this.nodeStroke = nodeStrokeField.getBoundField('stroke');
    this.nodeStrokeWidth = nodeStrokeWidthField.getBoundField('stroke-width');

    this.edgeId = edgeIdField.getBoundField('id');
    this.edgeSource = edgeSourceField.getBoundField('source');
    this.edgeTarget = edgeTargetField.getBoundField('target');
    this.edgeSize = edgeSizeField.getBoundField('edgeSize');
    this.edgeStroke = edgeStroke.getBoundField('stroke');
    this.edgeStrokeWidth = edgeStrokeWidth.getBoundField('stroke-width');
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
