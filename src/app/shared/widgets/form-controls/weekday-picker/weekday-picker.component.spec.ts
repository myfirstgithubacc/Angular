import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekdayPickerComponent } from './weekday-picker.component';

describe('WeekdayPickerComponent', () => {
  let component: WeekdayPickerComponent;
  let fixture: ComponentFixture<WeekdayPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeekdayPickerComponent]
    });
    fixture = TestBed.createComponent(WeekdayPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
