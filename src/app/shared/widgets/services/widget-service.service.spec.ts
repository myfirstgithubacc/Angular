import { TestBed } from '@angular/core/testing';

import { WidgetServiceService } from './widget-service.service';

describe('WidgetServiceService', () => {
  let service: WidgetServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
