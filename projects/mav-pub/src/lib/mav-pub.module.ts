import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

import { VisualizationsModule } from './visualizations/visualizations.module';

import { MavPubUiComponent } from './mav-pub-ui/mav-pub-ui.component';
import { LightThemeComponent } from './light-theme/light-theme.component';
import { DatabaseService } from './shared/database.service';


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
    VisualizationsModule
  ],
  declarations: [MavPubUiComponent, LightThemeComponent],
  exports: [MavPubUiComponent],
  providers: [ DatabaseService ]
})
export class MavPubModule { }
