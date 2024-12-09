import { TestBed } from '@angular/core/testing';

import { TerminationReasonService } from './termination-reason.service';

describe('TerminationReasonService', () => {
  let service: TerminationReasonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerminationReasonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
