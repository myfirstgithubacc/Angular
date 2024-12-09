import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalWidgetV2Component } from './approval-widget-v2.component';

describe('ApprovalWidgetV2Component', () => {
  let component: ApprovalWidgetV2Component;
  let fixture: ComponentFixture<ApprovalWidgetV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovalWidgetV2Component]
    });
    fixture = TestBed.createComponent(ApprovalWidgetV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
