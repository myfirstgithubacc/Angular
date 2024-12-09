import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreShiftComponent } from './core-shift.component';

describe('CoreShiftComponent', () => {
  let component: CoreShiftComponent;
  let fixture: ComponentFixture<CoreShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
