import { TestBed } from '@angular/core/testing';

import { StaffingAgencyService } from './staffing-agency.service';

describe('StaffingAgencyService', () => {
  let service: StaffingAgencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffingAgencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
