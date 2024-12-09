import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalFormV2Component } from './approval-form-v2.component';

describe('ApprovalFormV2Component', () => {
  let component: ApprovalFormV2Component;
  let fixture: ComponentFixture<ApprovalFormV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovalFormV2Component]
    });
    fixture = TestBed.createComponent(ApprovalFormV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
