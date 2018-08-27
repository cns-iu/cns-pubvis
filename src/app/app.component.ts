import { Component, OnInit } from '@angular/core';

import { MavPubDatabase, DatabaseService } from 'cns-pubvis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CNS Publications Visualizer';
  public dataLoaded = false;
  constructor(private databaseService: DatabaseService) { }

  ngOnInit() {
    fetch('assets/database.json').then(async (resp) => {
      const data = await resp.json();
      this.databaseService.setDatabase(new MavPubDatabase(data));
      setTimeout(() => {
        this.dataLoaded = true;
      }, 50);
    });
  }
}
