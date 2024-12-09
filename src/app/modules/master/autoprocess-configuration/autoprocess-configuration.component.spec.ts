import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoprocessConfigurationComponent } from './autoprocess-configuration.component';

describe('AutoprocessConfigurationComponent', () => {
  let component: AutoprocessConfigurationComponent;
  let fixture: ComponentFixture<AutoprocessConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoprocessConfigurationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutoprocessConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
