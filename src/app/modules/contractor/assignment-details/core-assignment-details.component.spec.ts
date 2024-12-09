import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreAssignmentDetailsComponent } from './core-assignment-details.component';

describe('CoreAssignmentDetailsComponent', () => {
  let component: CoreAssignmentDetailsComponent;
  let fixture: ComponentFixture<CoreAssignmentDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreAssignmentDetailsComponent]
    });
    fixture = TestBed.createComponent(CoreAssignmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
