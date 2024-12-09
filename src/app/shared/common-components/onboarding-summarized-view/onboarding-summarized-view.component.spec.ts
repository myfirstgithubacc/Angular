import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingSummarizedViewComponent } from './onboarding-summarized-view.component';

describe('OnboardingSummarizedViewComponent', () => {
  let component: OnboardingSummarizedViewComponent;
  let fixture: ComponentFixture<OnboardingSummarizedViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardingSummarizedViewComponent]
    });
    fixture = TestBed.createComponent(OnboardingSummarizedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
