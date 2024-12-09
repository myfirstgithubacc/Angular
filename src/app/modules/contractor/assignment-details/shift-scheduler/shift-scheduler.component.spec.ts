import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSchedulerComponent } from './shift-scheduler.component';

describe('ShiftSchedulerComponent', () => {
  let component: ShiftSchedulerComponent;
  let fixture: ComponentFixture<ShiftSchedulerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftSchedulerComponent]
    });
    fixture = TestBed.createComponent(ShiftSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
