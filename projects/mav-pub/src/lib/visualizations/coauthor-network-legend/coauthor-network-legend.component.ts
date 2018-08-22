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

import { BoundField } from '@ngx-dino/core';

import { Author, CoAuthorEdge } from '../shared/author';
import { Filter } from '../shared/filter';

import { CoauthorNetworkDataService } from '../shared/coauthor-network/coauthor-network-data.service';
import { nodeSizeField, edgeSizeField, nodeColorField} from '../shared/coauthor-network/coauthor-network-fields';

@Component({
  selector: 'mav-pub-coauthor-network-legend',
  templateUrl: './coauthor-network-legend.component.html',
  styleUrls: ['./coauthor-network-legend.component.sass']
})
export class CoauthorNetworkLegendComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};
  @Input() numCoAuthors = 50;
  @Input() edgeSizeRange: number[];
  @Output() filterUpdateComplete = new EventEmitter<boolean>();

  filteredAuthors: Observable<Author[]>;
  filteredCoauthors: Observable<CoAuthorEdge[]>;

  nodeSize: BoundField<number>;
  edgeSize: BoundField<number>;
  nodeColorEncoding: BoundField<number>;

  gradient = '';
  colorLegendTitle: string;
  edgeLegendTitle: string;
  minColorValueLabel: string;
  midColorValueLabel: string;
  maxColorValueLabel: string;
  maxEdgeLegendLabel: string;
  midEdgeLegendLabel: string;
  minEdgeLegendLabel: string;
  maxEdge: number;
  midEdge: number;
  minEdge: number;

  edgeSizeScale: any;
  numCoauthorScale: any;

  constructor(private dataService: CoauthorNetworkDataService) {
    this.filteredAuthors = this.dataService.filteredAuthors.asObservable();
    this.filteredCoauthors = this.dataService.filteredCoauthors.asObservable();
  }

  ngOnInit() {
    this.colorLegendTitle = this.dataService.colorLegendEncoding;
    this.edgeLegendTitle = this.dataService.edgeLegendEncoding;
    this.minColorValueLabel = '';
    this.midColorValueLabel = '';
    this.maxColorValueLabel = '';
    this.gradient = `linear-gradient(to top, ${this.dataService.nodeColorRange.join(', ')})`;

    // not user facing
    this.nodeSize = nodeSizeField.getBoundField('size');
    this.edgeSize = edgeSizeField.getBoundField('edgeSize');
    this.nodeColorEncoding = nodeColorField.getBoundField('color');

    this.filteredCoauthors.subscribe((coauthorEdges) => {
      this.updateEdgeLegendLabels(coauthorEdges);
      this.updateEdgeLegendSizes(coauthorEdges);
    });
    this.filteredAuthors.subscribe((authors) => {
      this.updateColorLegendLabels(authors);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (('filter' in changes) && this.filter) {
      const filter: Partial<Filter> = Object.assign({}, this.filter, {limit: this.numCoAuthors});
      this.dataService.fetchData(filter).subscribe(undefined, undefined, () => {
        this.filterUpdateComplete.emit(true);
      });
    }
  }

  updateEdgeLegendLabels(coauthorEdges: CoAuthorEdge[]) {
    this.maxEdge = Math.round(d3Array.max(coauthorEdges, (d: any) => this.edgeSize.get(d)));
    this.minEdge = Math.round(d3Array.min(coauthorEdges, (d: any) => this.edgeSize.get(d)));
    this.midEdge = Math.round((this.maxEdge + this.minEdge) / 2);
    this.maxEdgeLegendLabel = (!isNaN(this.maxEdge)) ? this.maxEdge.toString() : '';
    this.midEdgeLegendLabel = (!isNaN(this.midEdge)) ? this.midEdge.toString() : '';
    this.minEdgeLegendLabel = (!isNaN(this.minEdge)) ? this.minEdge.toString() : '';
  }

  updateEdgeLegendSizes(coauthorEdges: CoAuthorEdge[]) {
    this.edgeSizeScale = scaleLinear()
    .domain([0, d3Array.max(coauthorEdges, (d: any) => this.edgeSize.get(d))])
    .range(this.dataService.edgeSizeRange);

    d3Selection.select('#maxEdge').select('line').attr('stroke-width', this.edgeSizeScale(this.maxEdge));
    d3Selection.select('#midEdge').select('line').attr('stroke-width', this.edgeSizeScale(this.midEdge));
    d3Selection.select('#minEdge').select('line').attr('stroke-width', this.edgeSizeScale(this.minEdge));
  }

  updateColorLegendLabels(authors: Author[]) {
    const maxColorValue = Math.round(d3Array.max(authors, (d: any) => this.nodeColorEncoding.get(d)));
    const minColorValue = Math.round(d3Array.min(authors, (d: any) => this.nodeColorEncoding.get(d)));
    const midColorValue = Math.round((maxColorValue + minColorValue) / 2);
    this.maxColorValueLabel = (!isNaN(maxColorValue)) ? maxColorValue.toString() : '';
    this.midColorValueLabel = (!isNaN(midColorValue)) ? midColorValue.toString() : '';
    this.minColorValueLabel = (!isNaN(minColorValue)) ? minColorValue.toString() : '';
  }
}
