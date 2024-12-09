import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitAdderConfigurationsComponent } from './benefit-adder-configurations.component';

describe('BenefitAdderConfigurationsComponent', () => {
  let component: BenefitAdderConfigurationsComponent;
  let fixture: ComponentFixture<BenefitAdderConfigurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenefitAdderConfigurationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BenefitAdderConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
