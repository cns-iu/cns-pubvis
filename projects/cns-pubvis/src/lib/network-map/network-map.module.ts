import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { NetworkMapComponent } from './network-map/network-map.component';


@NgModule({
  declarations: [ NetworkMapComponent ],
  imports: [
    CommonModule,
    NgxMapboxGLModule
  ],
  exports: [ NetworkMapComponent ]
})
export class NetworkMapModule { }
