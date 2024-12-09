import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreStaffingAgencyMarkupComponent } from './core-staffing-agency-markup.component';

describe('CoreStaffingAgencyMarkupComponent', () => {
  let component: CoreStaffingAgencyMarkupComponent;
  let fixture: ComponentFixture<CoreStaffingAgencyMarkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreStaffingAgencyMarkupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreStaffingAgencyMarkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
