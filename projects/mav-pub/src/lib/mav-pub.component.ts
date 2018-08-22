import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mav-pub',
  template: `
    <mav-pub-light-theme *ngIf="theme === 'light-theme'"></mav-pub-light-theme>
    <div [class]="theme">
      <mav-pub-ui></mav-pub-ui>
    </div>
  `,
  styles: []
})
export class MavPubComponent implements OnInit {
  @Input() theme = 'light-theme';

  constructor() { }

  ngOnInit() {
  }

}
