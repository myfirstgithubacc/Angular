import { TestBed } from '@angular/core/testing';

import { WorkerClassificationService } from './worker-classification.service';

describe('WorkerClassificationService', () => {
  let service: WorkerClassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerClassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
