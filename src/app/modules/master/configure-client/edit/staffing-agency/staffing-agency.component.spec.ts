import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffingAgencyComponent } from './staffing-agency.component';

describe('StaffingAgencyComponent', () => {
  let component: StaffingAgencyComponent;
  let fixture: ComponentFixture<StaffingAgencyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StaffingAgencyComponent]
    });
    fixture = TestBed.createComponent(StaffingAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
