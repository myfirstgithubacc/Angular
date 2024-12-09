/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { UserActivationService } from './user-activation.service';

describe('Service: UserActivation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserActivationService]
    });
  });

  it('should ...', inject([UserActivationService], (service: UserActivationService) => {
    expect(service).toBeTruthy();
  }));
});
