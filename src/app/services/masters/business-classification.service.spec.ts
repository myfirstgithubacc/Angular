import { TestBed } from '@angular/core/testing';

import { BusinessClassificationService } from './business-classification.service';

describe('BusinessClassificationService', () => {
  let service: BusinessClassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessClassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
