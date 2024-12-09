import { TestBed } from '@angular/core/testing';

import { WindowScrollTopService } from './window-scroll-top.service';

describe('WindowScrollTopService', () => {
  let service: WindowScrollTopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowScrollTopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
