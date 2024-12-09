import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XrmTimeClockComponent } from './xrm-time-clock.component';

describe('XrmTimeClockComponent', () => {
  let component: XrmTimeClockComponent;
  let fixture: ComponentFixture<XrmTimeClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XrmTimeClockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XrmTimeClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
