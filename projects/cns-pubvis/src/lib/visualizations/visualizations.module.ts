import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatatableModule } from '@ngx-dino/datatable';
import { LegendModule } from '@ngx-dino/legend';
import { NetworkModule } from '@ngx-dino/network';
import { ScienceMapModule } from '@ngx-dino/science-map';
import { NouisliderModule } from 'ng2-nouislider';

import { BottomSheetTableComponent } from './bottom-sheet-table/bottom-sheet-table.component';
import { CoauthorNetworkLegendComponent } from './coauthor-network-legend/coauthor-network-legend.component';
import { CoauthorNetworkComponent } from './coauthor-network/coauthor-network.component';
import { FilterComponent } from './filter/filter.component';
import { ScienceMapLegendComponent } from './science-map-legend/science-map-legend.component';
import { ScienceMapComponent } from './science-map/science-map.component';
import { CoauthorNetworkDataService } from './shared/coauthor-network/coauthor-network-data.service';
import { ScienceMapDataService } from './shared/science-map/science-map-data.service';
import { StatisticsService } from './shared/statistics/statistics.service';
import { StatisticsComponent } from './statistics/statistics.component';


@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NouisliderModule,
    DatatableModule,
    NetworkModule,
    ScienceMapModule,
    LegendModule,
  ],
  exports: [
    FilterComponent,
    CoauthorNetworkComponent,
    ScienceMapComponent,
    StatisticsComponent,
    CoauthorNetworkLegendComponent,
    ScienceMapLegendComponent
  ],
  declarations: [
    FilterComponent,
    CoauthorNetworkComponent,
    ScienceMapComponent,
    StatisticsComponent,
    CoauthorNetworkLegendComponent,
    ScienceMapLegendComponent,
    BottomSheetTableComponent
  ],
  providers: [
    CoauthorNetworkDataService,
    ScienceMapDataService,
    StatisticsService
  ]
})
export class VisualizationsModule { }
