import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceFilterTooltipComponent } from './advance-filter-tooltip.component';

describe('AdvanceFilterTooltipComponent', () => {
  let component: AdvanceFilterTooltipComponent;
  let fixture: ComponentFixture<AdvanceFilterTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvanceFilterTooltipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvanceFilterTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
