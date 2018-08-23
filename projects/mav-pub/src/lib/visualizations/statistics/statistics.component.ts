import {
  Component, Input,
  OnInit, OnChanges,
  SimpleChanges, ViewEncapsulation
} from '@angular/core';
import { BoundField } from '@ngx-dino/core';

import { Filter } from '../../shared/filter';
import { Statistics } from '../shared/statistics/statistics';
import { AuthorsByYearFields, PublicationsByYearFields } from '../shared/statistics/statistics-fields';
import { StatisticsService } from '../shared/statistics/statistics.service';


@Component({
  selector: 'mav-pub-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class StatisticsComponent implements OnInit, OnChanges {
  @Input() filter: Partial<Filter> = {};

  statistics: Statistics = {} as Statistics;

  nAuthorsByYearIdField = AuthorsByYearFields.yearField.getBoundField('default');
  nAuthorsByYearFields: BoundField<any>[] = [
    AuthorsByYearFields.yearField.getBoundField('default'),
    AuthorsByYearFields.authorCountField.getBoundField('default')
  ];

  nPublicationsByYearIdField = PublicationsByYearFields.yearField.getBoundField('default');
  nPublicationsByYearFields: BoundField<any>[] = [
    PublicationsByYearFields.yearField.getBoundField('default'),
    PublicationsByYearFields.publicationCountField.getBoundField('default')
  ];

  constructor(private service: StatisticsService) {
    service.statistics.subscribe((s) => console.log(this.statistics = s));
  }

  ngOnInit() {
    this.service.fetchData(this.filter);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('filter' in changes) {
      this.service.fetchData(this.filter);
    }
  }
}
