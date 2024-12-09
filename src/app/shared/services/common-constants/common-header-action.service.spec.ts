import { TestBed } from '@angular/core/testing';

import { CommonHeaderActionService } from './common-header-action.service';

describe('CommonHeaderActionService', () => {
  let service: CommonHeaderActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonHeaderActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
