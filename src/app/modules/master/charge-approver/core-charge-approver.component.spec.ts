import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreChargeApproverComponent } from './core-charge-approver.component';

describe('CoreChargeApproverComponent', () => {
  let component: CoreChargeApproverComponent;
  let fixture: ComponentFixture<CoreChargeApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreChargeApproverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreChargeApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
