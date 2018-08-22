import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { MavPubModule } from 'mav-pub';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MavPubModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
