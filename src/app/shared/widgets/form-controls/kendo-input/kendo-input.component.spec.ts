import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoInputComponent } from './kendo-input.component';

describe('KendoInputComponent', () => {
  let component: KendoInputComponent;
  let fixture: ComponentFixture<KendoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KendoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KendoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
