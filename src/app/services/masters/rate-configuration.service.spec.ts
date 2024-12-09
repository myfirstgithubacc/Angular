import { TestBed } from '@angular/core/testing';

import { RateConfigurationService } from './rate-configuration.service';

describe('RateConfigurationService', () => {
  let service: RateConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RateConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
