import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiterReportComponent } from './fiter-report.component';

describe('FiterReportComponent', () => {
  let component: FiterReportComponent;
  let fixture: ComponentFixture<FiterReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FiterReportComponent]
    });
    fixture = TestBed.createComponent(FiterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
