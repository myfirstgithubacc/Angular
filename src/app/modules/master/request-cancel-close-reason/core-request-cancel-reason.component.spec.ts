import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRequestCancelReasonComponent } from './core-request-cancel-reason.component';

describe('CoreRequestCancelReasonComponent', () => {
  let component: CoreRequestCancelReasonComponent;
  let fixture: ComponentFixture<CoreRequestCancelReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreRequestCancelReasonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreRequestCancelReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
