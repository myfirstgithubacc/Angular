import { TestBed } from '@angular/core/testing';

import { ReviewlinkService } from './reviewlink.service';

describe('ReviewlinkService', () => {
  let service: ReviewlinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewlinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
