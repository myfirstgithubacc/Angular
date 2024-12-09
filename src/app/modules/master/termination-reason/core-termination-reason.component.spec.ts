import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreTerminationReasonComponent } from './core-termination-reason.component';

describe('CoreTerminationReasonComponent', () => {
  let component: CoreTerminationReasonComponent;
  let fixture: ComponentFixture<CoreTerminationReasonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreTerminationReasonComponent]
    });
    fixture = TestBed.createComponent(CoreTerminationReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
