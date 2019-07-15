import { DatabaseService } from './../shared/database.service';
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
  @ViewChild('tabs', { static: true }) tabs: any;
  @ViewChild('coauthorNetwork', { static: false }) coauthorNetwork: any;
  @ViewChild('scienceMap', { static: false }) scienceMap: any;

  filter: Partial<Filter>;
  filtersUpdating = false;

  openState = true;
  tabIndex = 0;

  narrowWidth = window.innerWidth - 360;
  wideWidth = window.innerWidth;
  height = window.innerHeight - 130;

  constructor(private element: ElementRef, private databaseService: DatabaseService) {
    this.databaseService.getPublications().subscribe(pubs => {
      const filter: Partial<Filter> = {year: {start: 100000, end: -100000}};
      for (const pub of pubs) {
        if (pub.year) {
          filter.year.start = Math.min(filter.year.start, pub.year);
          filter.year.end = Math.max(filter.year.end, pub.year);
        }
      }
      if (filter.year.start !== 100000) {
        this.filter = filter;
      } else {
        this.filter = {};
      }
    });
  }

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
