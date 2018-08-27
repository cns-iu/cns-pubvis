import { TestBed, inject } from '@angular/core/testing';

import { ScienceMapDataService } from './science-map-data.service';

describe('ScienceMapDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScienceMapDataService]
    });
  });

  it('should be created', inject([ScienceMapDataService], (service: ScienceMapDataService) => {
    expect(service).toBeTruthy();
  }));
});
