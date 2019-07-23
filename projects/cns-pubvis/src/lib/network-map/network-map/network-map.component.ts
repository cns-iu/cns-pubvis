import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import {
  RawChangeSet, BoundField, DatumId, NgxDinoEvent, Datum, ChangeSet, idSymbol, simpleField, combine, rawDataSymbol
} from '@ngx-dino/core';
import { BuiltinSymbolTypes, Point, Node, Edge } from '@ngx-dino/network';
import { conforms, differenceBy, filter } from 'lodash';
import { Map, MapMouseEvent, Point as MapBoxPoint, PointLike, MapLayerMouseEvent } from 'mapbox-gl';
import { Observable } from 'rxjs';

import { blankStyle } from '../shared/blank-style';
import { Cartesian2dBounds, Cartesian2dProjection } from '../shared/cartesian-2d-projection';
import { EdgesGeojson } from '../shared/edges-geojson';
import { NetworkMapDataService } from '../shared/network-map-data.service';
import { NodesGeojson } from '../shared/nodes-geojson';
import { DataDrivenIcons } from '../shared/data-driven-icons';


@Component({
  selector: 'cns-pubvis-network-map',
  templateUrl: './network-map.component.html',
  styleUrls: ['./network-map.component.css'],
  providers: [NetworkMapDataService]
})
export class NetworkMapComponent implements OnChanges {
  // Nodes
  @Input() nodeStream: Observable<RawChangeSet>;
  @Input() nodeIdField: BoundField<DatumId>;
  @Input() nodePositionField: BoundField<Point>;
  @Input() nodeXField: BoundField<number>;
  @Input() nodeYField: BoundField<number>;
  @Input() nodeSizeField: BoundField<number>;
  @Input() nodeSymbolField: BoundField<BuiltinSymbolTypes>;
  @Input() nodeColorField: BoundField<string>;
  @Input() nodeStrokeField: BoundField<string>;
  @Input() nodeStrokeWidthField: BoundField<number>;
  @Input() nodeTooltipField: BoundField<string>;
  @Input() nodeLabelField: BoundField<string>;
  @Input() nodeLabelPositionField: BoundField<string>;
  @Input() nodeTransparencyField: BoundField<number>;
  @Input() strokeTransparencyField: BoundField<number>;
  @Input() nodePulseField: BoundField<boolean>;

  // Edges
  @Input() edgeStream: Observable<RawChangeSet>;
  @Input() edgeIdField: BoundField<DatumId>;
  @Input() edgeSourceField: BoundField<Point>;
  @Input() edgeSourceXField: BoundField<number>;
  @Input() edgeSourceYField: BoundField<number>;
  @Input() edgeTargetField: BoundField<Point>;
  @Input() edgeTargetXField: BoundField<number>;
  @Input() edgeTargetYField: BoundField<number>;
  @Input() edgeStrokeField: BoundField<string>;
  @Input() edgeStrokeWidthField: BoundField<number>;
  @Input() edgeTransparencyField: BoundField<number>;

  // Outputs
  @Output() nodeClick = new EventEmitter<NgxDinoEvent>();
  @Output() edgeClick = new EventEmitter<NgxDinoEvent>();

  // Tooltip element
  @ViewChild('tooltipElement', {static: true}) tooltipElement: ElementRef<HTMLDivElement>;

  style = blankStyle;
  map: Map;

  bounds = new Cartesian2dBounds();
  projection = new Cartesian2dProjection(this.bounds);
  nodesGeoJson: NodesGeojson;
  edgesGeoJson: EdgesGeojson;

  nodes: Node[] = [];
  edges: Edge[] = [];

  constructor(private service: NetworkMapDataService) {
    const pointConform = conforms({
      [0]: isFinite,
      [1]: isFinite
    });
    const nodeConform = conforms({
      position: pointConform,
      size: isFinite
    });
    const edgeConform = conforms({
      source: pointConform,
      target: pointConform
    });

    this.service.nodes.subscribe((set) => {
      const filtered = this.nodes = filter(this.applyChangeSet(set, this.nodes), nodeConform) as any;
      this.layout(filtered);
    });

    this.service.edges.subscribe((set) => {
      const filtered = this.edges = filter(this.applyChangeSet(set, this.edges), edgeConform) as any;
      this.layout(undefined, filtered);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.detectStreamOrFieldChanges(changes, 'node', () => {
      this.nodes = [];
      this.service.fetchNodes(
        this.nodeStream, this.nodeIdField,
        this.getPositionField(this.nodePositionField, this.nodeXField, this.nodeYField),
        this.nodeSizeField, this.nodeSymbolField, this.nodeColorField,
        this.nodeStrokeField, this.nodeStrokeWidthField, this.nodeTooltipField,
        this.nodeLabelField, this.nodeLabelPositionField, this.nodeTransparencyField,
        this.strokeTransparencyField, this.nodePulseField
      );
    }, () => {
      this.nodes = [];
      this.service.updateNodes(
        this.getPositionField(this.nodePositionField, this.nodeXField, this.nodeYField),
        this.nodeSizeField, this.nodeSymbolField, this.nodeColorField, this.nodeStrokeField,
        this.nodeStrokeWidthField, this.nodeTooltipField, this.nodeLabelField,
        this.nodeLabelPositionField, this.nodeTransparencyField,
        this.strokeTransparencyField, this.nodePulseField
      );
    });

    this.detectStreamOrFieldChanges(changes, 'edge', () => {
      this.edges = [];
      this.service.fetchEdges(
        this.edgeStream, this.edgeIdField,
        this.getPositionField(this.edgeSourceField, this.edgeSourceXField, this.edgeSourceYField),
        this.getPositionField(this.edgeTargetField, this.edgeTargetXField, this.edgeTargetYField),
        this.edgeStrokeField, this.edgeStrokeWidthField, this.edgeTransparencyField
      );
    }, () => {
      this.edges = [];
      this.service.updateEdges(
        this.getPositionField(this.edgeSourceField, this.edgeSourceXField, this.edgeSourceYField),
        this.getPositionField(this.edgeTargetField, this.edgeTargetXField, this.edgeTargetYField),
        this.edgeStrokeField, this.edgeStrokeWidthField, this.edgeTransparencyField
      );
    });
  }

  private toNgxDinoEvent(event: MapMouseEvent, layers: string[], data: Datum[]): NgxDinoEvent | undefined {
    const bboxMargin = new MapBoxPoint(4, 4);
    const pointBox: [PointLike, PointLike] = [ event.point.sub(bboxMargin), event.point.add(bboxMargin) ];
    const features = this.map.queryRenderedFeatures(pointBox, {layers});
    const itemId = features[0].properties[idSymbol];
    const item = data.find(i => i[idSymbol] === itemId);
    if (item) {
      return new NgxDinoEvent(event.originalEvent, item[rawDataSymbol], item, this);
    }
  }
  nodeClicked(event: MapMouseEvent): void {
    const ngxDinoEvent = this.toNgxDinoEvent(event, ['nodes'], this.nodes);
    if (ngxDinoEvent) {
      this.nodeClick.emit(ngxDinoEvent);
    }
  }
  edgeClicked(event: MapMouseEvent): void {
    const ngxDinoEvent = this.toNgxDinoEvent(event, ['edges'], this.edges);
    if (ngxDinoEvent) {
      this.edgeClick.emit(ngxDinoEvent);
    }
  }

  onMouseEnter(event: MapLayerMouseEvent): void {
    this.map.getCanvas().style.cursor = 'pointer';
    const tooltip = event.features[0].properties.tooltip;
    this.showTooltip(event.originalEvent, tooltip);
  }
  onMouseLeave(event: MapLayerMouseEvent): void {
    this.hideTooltip();
  }
  showTooltip(event: any, tooltip: string): void {
    const el = this.tooltipElement.nativeElement;
    const { x, y } = event;
    if (!el || !tooltip) {
      return;
    }

    el.textContent = tooltip;
    el.style.left = `${x - 40}px`;
    el.style.top = `${y - 40}px`;
    el.style.visibility = 'visible';
  }
  hideTooltip(): void {
    const el = this.tooltipElement.nativeElement;
    if (!el) {
      return;
    }

    el.style.visibility = 'hidden';
  }

  onMapLoad(map: Map) {
    this.map = map;
    this.map.resize();
    new DataDrivenIcons().addTo(map);
  }

  private detectStreamOrFieldChanges(
    changes: SimpleChanges, prefix: 'node' | 'edge',
    fetch: () => void, update: () => void
  ): void {
    const re = new RegExp('^' + prefix);
    let shouldUpdate = false;
    for (const prop in changes) {
      if (!re.test(prop)) {
        continue;
      }

      if (/(Stream)|(IdField)$/.test(prop)) {
        shouldUpdate = false;
        fetch();
        break;
      } else if (/Field$/.test(prop)) {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      update();
    }
  }

  private applyChangeSet<T extends Datum>(set: ChangeSet<any>, data: T[]): T[] {
    const result = differenceBy(data, set.remove.toArray(), set.replace.toArray(), idSymbol);
    set.insert.forEach(item => result.push(item as T));
    set.replace.forEach(item => result.push(item as T));

    return result;
  }

  private layout(nodes?: Node[], edges?: Edge[]): void {
    const bounds = this.bounds;
    if (nodes && nodes.length) {
      nodes.forEach(n => {
        if (n.position) { bounds.extend(...n.position); }
      });
      this.nodesGeoJson = new NodesGeojson(nodes, this.projection);
    }
    if (edges && edges.length) {
      edges.forEach(e => {
        if (e.source) { bounds.extend(...e.source); }
        if (e.target) { bounds.extend(...e.target); }
      });
      this.edgesGeoJson = new EdgesGeojson(edges, this.projection);
    }
  }

  private getPositionField(
    position: BoundField<Point>, x: BoundField<number>, y: BoundField<number>
  ): BoundField<Point> {
    if (position) {
      const wrapped = position.operator.wrapped;
      // Test for !ConstantOperator(undefined | null)
      if (!('value' in wrapped) || wrapped['value'] != null) {
        return position;
      }
    }

    const field = simpleField({
      label: 'Combined Position',
      operator: combine<any, Point>([x && x.operator, y && y.operator])
    });
    return field.getBoundField();
  }
}
