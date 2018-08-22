import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NouisliderModule } from 'ng2-nouislider';

import { DinoDatatableModule } from '@ngx-dino/datatable';
import { DinoForceNetworkModule } from '@ngx-dino/force-network';
import { DinoScienceMapModule } from '@ngx-dino/science-map';
import { DinoScienceMapLegendModule } from '@ngx-dino/science-map-legend';

import { FilterComponent } from './filter/filter.component';

import { CoauthorNetworkComponent } from './coauthor-network/coauthor-network.component';
import { ScienceMapComponent } from './science-map/science-map.component';
import { StatisticsComponent } from './statistics/statistics.component';

import { DatabaseService } from './shared/database.service';
import { CoauthorNetworkDataService } from './shared/coauthor-network/coauthor-network-data.service';
import { ScienceMapDataService } from './shared/science-map/science-map-data.service';
import { StatisticsService } from './shared/statistics/statistics.service';
import { CoauthorNetworkLegendComponent } from './coauthor-network-legend/coauthor-network-legend.component';
import { ScienceMapLegendComponent } from './science-map-legend/science-map-legend.component';


@NgModule({
  imports: [
    CommonModule,

    NouisliderModule,

    DinoDatatableModule,
    DinoForceNetworkModule,
    DinoScienceMapModule,
    DinoScienceMapLegendModule
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
    DatabaseService,
    CoauthorNetworkDataService,
    ScienceMapDataService,
    StatisticsService
  ]
})
export class VisualizationsModule { }
