import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HdrMockScreenComponent } from './hdr-mock-screen.component';

describe('HdrMockScreenComponent', () => {
  let component: HdrMockScreenComponent;
  let fixture: ComponentFixture<HdrMockScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HdrMockScreenComponent]
    });
    fixture = TestBed.createComponent(HdrMockScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
