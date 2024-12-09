import { TestBed } from '@angular/core/testing';

import { PageAccessLoggerService } from './page-access-logger.service';

describe('PageAccessLoggerService', () => {
  let service: PageAccessLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageAccessLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
