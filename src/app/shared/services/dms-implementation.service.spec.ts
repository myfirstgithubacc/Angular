import { TestBed } from '@angular/core/testing';

import { DmsImplementationService } from './dms-implementation.service';

describe('DmsImplementationService', () => {
  let service: DmsImplementationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DmsImplementationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
