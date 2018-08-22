import { Component, OnInit, ViewChild } from '@angular/core';

import { Filter } from '../visualizations/shared/filter';

@Component({
  selector: 'mav-pub-ui',
  templateUrl: './mav-pub-ui.component.html',
  styleUrls: ['./mav-pub-ui.component.scss']
})
export class MavPubUiComponent implements OnInit {
  @ViewChild('tabs') tabs: any;

  filter: Partial<Filter> = {};

  tabIndex = 0;

  filtersUpdating = false;
  openState = true;

  narrowWidth = window.innerWidth - 360;
  wideWidth = window.innerWidth;
  height = window.innerHeight - 130;

  warningChip = { label: `WARNING: The data in this application is incomplete and messy. Please excuse odd
  results until we clean up the data.`, color: 'warn' };

  constructor() { }

  ngOnInit() {
    this.tabs.selectedIndexChange.subscribe((index) => (this.tabIndex = index));
  }
}
