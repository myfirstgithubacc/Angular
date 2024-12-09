import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRateConfigurationComponent } from './core-rate-configuration.component';

describe('CoreRateConfigurationComponent', () => {
  let component: CoreRateConfigurationComponent;
  let fixture: ComponentFixture<CoreRateConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreRateConfigurationComponent]
    });
    fixture = TestBed.createComponent(CoreRateConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
