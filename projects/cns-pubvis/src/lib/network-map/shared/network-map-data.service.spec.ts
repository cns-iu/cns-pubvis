import { TestBed } from '@angular/core/testing';

import { NetworkMapDataService } from './network-map-data.service';

describe('NetworkMapDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NetworkMapDataService = TestBed.get(NetworkMapDataService);
    expect(service).toBeTruthy();
  });
});
