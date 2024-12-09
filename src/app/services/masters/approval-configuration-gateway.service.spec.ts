import { TestBed } from '@angular/core/testing';

import { ApprovalConfigurationGatewayService } from './approval-configuration-gateway.service';

describe('ApprovalConfigurationGatewayService', () => {
  let service: ApprovalConfigurationGatewayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprovalConfigurationGatewayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
