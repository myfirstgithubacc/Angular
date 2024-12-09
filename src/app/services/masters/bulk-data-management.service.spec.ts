import { TestBed } from '@angular/core/testing';

import { BulkDataManagementService } from './bulk-data-management.service';

describe('BulkDataManagementService', () => {
  let service: BulkDataManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkDataManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
