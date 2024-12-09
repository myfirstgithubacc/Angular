import { TestBed } from '@angular/core/testing';

import { RestMealBreakService } from './rest-meal-break.service';

describe('RestMealBreakService', () => {
  let service: RestMealBreakService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestMealBreakService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
