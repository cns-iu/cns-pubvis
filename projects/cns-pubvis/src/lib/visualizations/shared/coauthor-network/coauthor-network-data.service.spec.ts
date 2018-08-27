import { TestBed, inject } from '@angular/core/testing';

import { CoauthorNetworkDataService } from './coauthor-network-data.service';

describe('coauthorNetworkDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoauthorNetworkDataService]
    });
  });

  it('should be created', inject([CoauthorNetworkDataService], (service: CoauthorNetworkDataService) => {
    expect(service).toBeTruthy();
  }));
});
