import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityClearanceComponent } from './security-clearance.component';

describe('SecurityClearanceComponent', () => {
  let component: SecurityClearanceComponent;
  let fixture: ComponentFixture<SecurityClearanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecurityClearanceComponent]
    });
    fixture = TestBed.createComponent(SecurityClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
