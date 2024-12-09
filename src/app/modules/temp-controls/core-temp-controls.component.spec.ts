import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreTempControlsComponent } from './core-temp-controls.component';

describe('CoreTempControlsComponent', () => {
  let component: CoreTempControlsComponent;
  let fixture: ComponentFixture<CoreTempControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreTempControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreTempControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
