import { TestBed } from '@angular/core/testing';

import { ManageCountryService } from './manage-country.service';

describe('ManageCountryService', () => {
  let service: ManageCountryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageCountryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
