import { TestBed } from '@angular/core/testing';

import { OnboardingRequirementsService } from './onboarding-requirements.service';

describe('OnboardingRequirementsService', () => {
  let service: OnboardingRequirementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingRequirementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
