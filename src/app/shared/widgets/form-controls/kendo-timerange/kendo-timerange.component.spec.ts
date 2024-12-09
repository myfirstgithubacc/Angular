import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoTimerangeComponent } from './kendo-timerange.component';

describe('KendoTimerangeComponent', () => {
  let component: KendoTimerangeComponent;
  let fixture: ComponentFixture<KendoTimerangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KendoTimerangeComponent]
    });
    fixture = TestBed.createComponent(KendoTimerangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
