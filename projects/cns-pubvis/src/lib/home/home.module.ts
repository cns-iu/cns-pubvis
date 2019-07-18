import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DatatableModule } from '@ngx-dino/datatable';

import { HomeComponent } from './home.component';


@NgModule({
  imports: [
    CommonModule,
    DatatableModule
  ],
  declarations: [
    HomeComponent
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }
