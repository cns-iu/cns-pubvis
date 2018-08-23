import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { Filter } from '../shared/filter';

@Component({
  selector: 'mav-pub-ui',
  templateUrl: './mav-pub-ui.component.html',
  styleUrls: ['./mav-pub-ui.component.scss']
})
export class MavPubUiComponent implements OnInit {
  @Input() title = 'Make-A-Vis for Publications';
  @Input() theme = 'light-theme';
  @ViewChild('tabs') tabs: any;
  @ViewChild('coauthorNetwork') coauthorNetwork: any;
  @ViewChild('scienceMap') scienceMap: any;

  filter: Partial<Filter> = {};
  filtersUpdating = false;

  openState = true;
  tabIndex = 0;

  narrowWidth = window.innerWidth - 360;
  wideWidth = window.innerWidth;
  height = window.innerHeight - 130;

  constructor() { }

  ngOnInit() {
    this.activate(0);
    this.tabs.selectedIndexChange.subscribe((index) => ((this.tabIndex = index), this.activate(index)));
  }

  private activate(index: number): void {
    const component = this.getComponentForIndex(index);
    if (component && typeof component.activate === 'function') {
      setTimeout(() => component.activate(), 0);
    }
  }

  private getComponentForIndex(index: number): any {
    switch (index) {
      case 0:
        return this.coauthorNetwork;
      case 1:
        return this.scienceMap;
      default:
        return undefined;
    }
  }
}
