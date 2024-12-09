import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSwitchComponent } from './dynamic-switch.component';

describe('DynamicSwitchComponent', () => {
  let component: DynamicSwitchComponent;
  let fixture: ComponentFixture<DynamicSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicSwitchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
