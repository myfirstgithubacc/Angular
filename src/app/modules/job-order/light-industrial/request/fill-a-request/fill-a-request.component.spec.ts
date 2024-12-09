import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillARequestComponent } from './fill-a-request.component';

describe('FillARequestComponent', () => {
  let component: FillARequestComponent;
  let fixture: ComponentFixture<FillARequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FillARequestComponent]
    });
    fixture = TestBed.createComponent(FillARequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
