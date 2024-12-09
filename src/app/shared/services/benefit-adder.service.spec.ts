import { TestBed } from '@angular/core/testing';

import { BenefitAdderService } from './benefit-adder.service';

describe('BenefitAdderService', () => {
  let service: BenefitAdderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenefitAdderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
