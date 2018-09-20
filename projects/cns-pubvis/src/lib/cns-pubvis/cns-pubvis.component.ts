import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AutoResizeResetEvent } from '@ngx-dino/core';
import { Filter } from '../shared/filter';

@Component({
  selector: 'cns-pubvis',
  templateUrl: './cns-pubvis.component.html',
  styleUrls: ['./cns-pubvis.component.scss']
})
export class CNSPubVisComponent implements OnInit {
  @Input() title = 'CNS Publications Visualizer';
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

  constructor(private element: ElementRef) { }

  ngOnInit() {
    this.activate(0);
    this.tabs.selectedIndexChange.subscribe((index) => ((this.tabIndex = index), this.activate(index)));
  }

  private activate(index: number): void {
    const target = this.element.nativeElement as EventTarget;
    if (target.dispatchEvent) {
      target.dispatchEvent(new AutoResizeResetEvent());
    }
  }
}
