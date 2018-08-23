import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NouisliderModule } from 'ng2-nouislider';

import { DatatableModule } from '@ngx-dino/datatable';
import { ForceNetworkModule } from '@ngx-dino/force-network';
import { ScienceMapModule } from '@ngx-dino/science-map';
import { LegendModule } from '@ngx-dino/legend';

import { FilterComponent } from './filter/filter.component';

import { CoauthorNetworkComponent } from './coauthor-network/coauthor-network.component';
import { ScienceMapComponent } from './science-map/science-map.component';
import { StatisticsComponent } from './statistics/statistics.component';

import { CoauthorNetworkDataService } from './shared/coauthor-network/coauthor-network-data.service';
import { ScienceMapDataService } from './shared/science-map/science-map-data.service';
import { StatisticsService } from './shared/statistics/statistics.service';
import { CoauthorNetworkLegendComponent } from './coauthor-network-legend/coauthor-network-legend.component';
import { ScienceMapLegendComponent } from './science-map-legend/science-map-legend.component';


@NgModule({
  imports: [
    CommonModule,
    NouisliderModule,
    DatatableModule,
    ForceNetworkModule,
    ScienceMapModule,
    LegendModule
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
    ScienceMapLegendComponent
  ],
  providers: [
    CoauthorNetworkDataService,
    ScienceMapDataService,
    StatisticsService
  ]
})
export class VisualizationsModule { }
