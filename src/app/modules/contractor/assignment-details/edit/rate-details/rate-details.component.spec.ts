import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateDetailsComponent } from './rate-details.component';

describe('RateDetailsComponent', () => {
  let component: RateDetailsComponent;
  let fixture: ComponentFixture<RateDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RateDetailsComponent]
    });
    fixture = TestBed.createComponent(RateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
