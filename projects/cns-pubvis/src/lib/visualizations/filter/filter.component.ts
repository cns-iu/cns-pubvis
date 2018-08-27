import {
  Component, Output, ViewChild,
  OnInit,
  ViewEncapsulation, EventEmitter
} from '@angular/core';
import { assign, clone } from 'lodash';
import { map } from 'rxjs/operators';

import { NouisliderComponent } from 'ng2-nouislider';

import { Filter } from '../../shared/filter';
import { DatabaseService } from '../../shared/database.service';


@Component({
  selector: 'cns-pubvis-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class FilterComponent implements OnInit {
  private filter: Partial<Filter> = {year: {start: 2002, end: 2017}};
  @Output() filterChange = new EventEmitter<Partial<Filter>>();

  @ViewChild(NouisliderComponent) yearSlider: NouisliderComponent;
  yearSliderConfig = {
    start: [2002, 2017],
    margin: 0,
    padding: [0, 0],
    step: 1,
    range: {
      min: [2002],
      max: [2017]
    },
    connect: [false, true, false],
    tooltips: [true, true],
    format: {
      to: Number,
      from: Number
    }
  };

  constructor(private service: DatabaseService) {}

  ngOnInit() {
    this.service.getDistinct('year').pipe(map((years: string[]) => {
      const sortedYears = years.map(Number)
        .filter((year) => year !== 0)
        .sort((y1, y2) => y1 - y2);
      return [sortedYears[0], sortedYears[sortedYears.length - 1]];
    })).subscribe(([min, max]) => {
      const config = {start: [min, max], range: {min, max}};

      if (this.yearSlider && this.yearSlider.slider) {
        setTimeout(() => this.yearSlider.slider.updateOptions(config));
      } else {
        Object.assign(this.yearSliderConfig, config);
      }
    });
  }

  onYearChange([start, end]: [number, number]): void {
    this.updateFilter({year: {start, end}});
  }

  private updateFilter(change: Partial<Filter>): void {
    assign(this.filter, change);
    this.filterChange.emit(clone(this.filter));
  }
}
