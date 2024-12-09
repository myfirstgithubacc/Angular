import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorePreDefinedReportComponent } from './core-pre-defined-report.component';

describe('CorePreDefinedReportComponent', () => {
  let component: CorePreDefinedReportComponent;
  let fixture: ComponentFixture<CorePreDefinedReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CorePreDefinedReportComponent]
    });
    fixture = TestBed.createComponent(CorePreDefinedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
