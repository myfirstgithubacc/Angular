import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreLightIndustrialComponent } from './core-light-industrial.component';

describe('CoreLightIndustrialComponent', () => {
  let component: CoreLightIndustrialComponent;
  let fixture: ComponentFixture<CoreLightIndustrialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreLightIndustrialComponent]
    });
    fixture = TestBed.createComponent(CoreLightIndustrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
