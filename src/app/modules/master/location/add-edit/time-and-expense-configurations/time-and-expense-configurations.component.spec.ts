import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAndExpenseConfigurationsComponent } from './time-and-expense-configurations.component';

describe('TimeAndExpenseConfigurationsComponent', () => {
  let component: TimeAndExpenseConfigurationsComponent;
  let fixture: ComponentFixture<TimeAndExpenseConfigurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeAndExpenseConfigurationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeAndExpenseConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
