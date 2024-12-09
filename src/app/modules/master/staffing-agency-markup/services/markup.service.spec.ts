import { TestBed } from '@angular/core/testing';

import { MarkupService } from './markup.service';

describe('MarkupService', () => {
  let service: MarkupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
