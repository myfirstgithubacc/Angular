import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoSwitchComponent } from './kendo-switch.component';

describe('KendoSwitchComponent', () => {
  let component: KendoSwitchComponent;
  let fixture: ComponentFixture<KendoSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KendoSwitchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KendoSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
