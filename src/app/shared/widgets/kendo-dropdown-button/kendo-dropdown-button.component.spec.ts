import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoDropdownButtonComponent } from './kendo-dropdown-button.component';

describe('KendoDropdownButtonComponent', () => {
  let component: KendoDropdownButtonComponent;
  let fixture: ComponentFixture<KendoDropdownButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KendoDropdownButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KendoDropdownButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
