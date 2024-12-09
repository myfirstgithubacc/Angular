import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoMultiselectAdditionalComponent } from './kendo-multiselect-additional.component';

describe('KendoMultiselectAdditionalComponent', () => {
  let component: KendoMultiselectAdditionalComponent;
  let fixture: ComponentFixture<KendoMultiselectAdditionalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KendoMultiselectAdditionalComponent]
    });
    fixture = TestBed.createComponent(KendoMultiselectAdditionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
