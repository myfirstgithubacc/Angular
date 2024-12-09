import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreStaffingAgencyComponent } from './core-staffing-agency.component';

describe('CoreStaffingAgencyComponent', () => {
  let component: CoreStaffingAgencyComponent;
  let fixture: ComponentFixture<CoreStaffingAgencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreStaffingAgencyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreStaffingAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
