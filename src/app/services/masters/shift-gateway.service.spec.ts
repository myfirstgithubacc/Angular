import { TestBed } from '@angular/core/testing';

import { ShiftGatewayService } from './shift-gateway.service';

describe('ShiftGatewayService', () => {
  let service: ShiftGatewayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftGatewayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
