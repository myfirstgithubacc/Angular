import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoDropdownAdditionalComponent } from './kendo-dropdown-additional.component';

describe('KendoDropdownAdditionalComponent', () => {
  let component: KendoDropdownAdditionalComponent;
  let fixture: ComponentFixture<KendoDropdownAdditionalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KendoDropdownAdditionalComponent]
    });
    fixture = TestBed.createComponent(KendoDropdownAdditionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
