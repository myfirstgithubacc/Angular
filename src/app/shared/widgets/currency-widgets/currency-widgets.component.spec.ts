import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyWidgetsComponent } from './currency-widgets.component';

describe('CurrencyWidgetsComponent', () => {
  let component: CurrencyWidgetsComponent;
  let fixture: ComponentFixture<CurrencyWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrencyWidgetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencyWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
