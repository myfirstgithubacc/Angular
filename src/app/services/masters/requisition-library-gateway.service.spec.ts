import { TestBed } from '@angular/core/testing';

import { RequisitionLibraryGatewayService } from './requisition-library-gateway.service';

describe('RequisitionLibraryGatewayService', () => {
  let service: RequisitionLibraryGatewayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequisitionLibraryGatewayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
