import { TestBed } from '@angular/core/testing';

import { ConfigureClientService } from './configure-client.service';

describe('ConfigureClientService', () => {
  let service: ConfigureClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigureClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
