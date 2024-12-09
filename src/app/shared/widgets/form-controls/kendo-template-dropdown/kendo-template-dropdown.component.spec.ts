import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoTemplateDropdownComponent } from './kendo-template-dropdown.component';

describe('KendoTemplateDropdownComponent', () => {
  let component: KendoTemplateDropdownComponent;
  let fixture: ComponentFixture<KendoTemplateDropdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KendoTemplateDropdownComponent]
    });
    fixture = TestBed.createComponent(KendoTemplateDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
