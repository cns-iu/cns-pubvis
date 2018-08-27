import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BoundField, RawChangeSet } from '@ngx-dino/core';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';
import { Filter } from '../../shared/filter';


import {
  nodeSizeField,
  nodeIdField,
  nodeColorField,
  nodeLabelField,
  nodeFixedXField,
  nodeFixedYField,
  edgeIdField,
  edgeSourceField,
  edgeTargetField,
  edgeSizeField
} from '../shared/coauthor-network/coauthor-network-fields';

@Component({
  selector: 'cns-pubvis-coauthor-network',
  templateUrl: './coauthor-network.component.html',
  styleUrls: ['./coauthor-network.component.sass']
})
export class CoauthorNetworkComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() numCoAuthors = 50;
  @Input() width = 0;
  @Input() height = 0;
  @Output() filterUpdateComplete = new EventEmitter<boolean>();
  @ViewChild('forceNetwork') forceNetwork: any;

  nodeStream: Observable<RawChangeSet>;
  edgeStream: Observable<RawChangeSet>;

  nodeId: BoundField<string>;
  nodeSize: BoundField<number>;
  nodeColor: BoundField<number>;
  nodeLabel: BoundField<string>;
  nodeFixedX: BoundField<number>;
  nodeFixedY: BoundField<number>;

  edgeId: BoundField<string>;
  edgeSource: BoundField<string>;
  edgeTarget: BoundField<string>;
  edgeSize: BoundField<number>;

  nodeColorRange: string[];

  visChargeStrength = -400;

  constructor(private dataService: CoauthorNetworkDataService) {
    this.dataService.nodeStream.subscribe((changes) => {
      this.nodeStream = of(changes);
    });
    this.dataService.edgeStream.subscribe((changes) => {
      this.edgeStream = of(changes);
    });
  }

  ngOnInit() {
    this.nodeId = nodeIdField.getBoundField('id');
    this.nodeSize = nodeSizeField.getBoundField('size');
    this.nodeColor = nodeColorField.getBoundField('color');
    this.nodeLabel = nodeLabelField.getBoundField('label');
    this.nodeColorRange = this.dataService.nodeColorRange;
    this.nodeFixedX = nodeFixedXField.getBoundField('fixedX');
    this.nodeFixedY = nodeFixedYField.getBoundField('fixedY');

    this.edgeId = edgeIdField.getBoundField('id');
    this.edgeSource = edgeSourceField.getBoundField('source');
    this.edgeTarget = edgeTargetField.getBoundField('target');
    this.edgeSize = edgeSizeField.getBoundField('edgeSize');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      const filter: Partial<Filter> = Object.assign({}, this.filter, {limit: this.numCoAuthors});
      this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
        this.filterUpdateComplete.emit(true);
      });
    }
  }

  activate(): void {
    this.forceNetwork.resizeSelf();
  }
}
