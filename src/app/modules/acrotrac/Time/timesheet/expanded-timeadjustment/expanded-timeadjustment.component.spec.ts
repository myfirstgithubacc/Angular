import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandedTimeadjustmentComponent } from './expanded-timeadjustment.component';

describe('ExpandedTimeadjustmentComponent', () => {
  let component: ExpandedTimeadjustmentComponent;
  let fixture: ComponentFixture<ExpandedTimeadjustmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpandedTimeadjustmentComponent]
    });
    fixture = TestBed.createComponent(ExpandedTimeadjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
