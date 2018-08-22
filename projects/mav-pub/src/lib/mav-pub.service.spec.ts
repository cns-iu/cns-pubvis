import { TestBed, inject } from '@angular/core/testing';

import { MavPubService } from './mav-pub.service';

describe('MavPubService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MavPubService]
    });
  });

  it('should be created', inject([MavPubService], (service: MavPubService) => {
    expect(service).toBeTruthy();
  }));
});
