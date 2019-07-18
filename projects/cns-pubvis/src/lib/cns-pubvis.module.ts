import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CNSPubVisComponent } from './cns-pubvis/cns-pubvis.component';
import { HomeModule } from './home/home.module';
import { LightThemeComponent } from './light-theme/light-theme.component';
import { DatabaseService } from './shared/database.service';
import { VisualizationsModule } from './visualizations/visualizations.module';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    VisualizationsModule,
    HomeModule
  ],
  declarations: [CNSPubVisComponent, LightThemeComponent],
  exports: [CNSPubVisComponent],
  providers: [ DatabaseService ]
})
export class CNSPubVisModule { }
