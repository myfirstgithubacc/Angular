import { TestBed } from '@angular/core/testing';

import { LaborCategoryGatewayService } from './labor-category-gateway.service';

describe('LaborCategoryGatewayService', () => {
  let service: LaborCategoryGatewayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaborCategoryGatewayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
