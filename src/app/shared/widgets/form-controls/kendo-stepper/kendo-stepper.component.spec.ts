import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoStepperComponent } from './kendo-stepper.component';

describe('KendoStepperComponent', () => {
  let component: KendoStepperComponent;
  let fixture: ComponentFixture<KendoStepperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KendoStepperComponent]
    });
    fixture = TestBed.createComponent(KendoStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
