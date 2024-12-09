import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoLabelComponent } from './kendo-label.component';

describe('KendoLabelComponent', () => {
  let component: KendoLabelComponent;
  let fixture: ComponentFixture<KendoLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KendoLabelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KendoLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
