import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingRequirementsComponent } from './onboarding-requirements.component';

describe('OnboardingRequirementsComponent', () => {
  let component: OnboardingRequirementsComponent;
  let fixture: ComponentFixture<OnboardingRequirementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardingRequirementsComponent]
    });
    fixture = TestBed.createComponent(OnboardingRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
