import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUserDefinedFieldsComponent } from './core-user-defined-fields.component';

describe('CoreUserDefinedFieldsComponent', () => {
  let component: CoreUserDefinedFieldsComponent;
  let fixture: ComponentFixture<CoreUserDefinedFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreUserDefinedFieldsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreUserDefinedFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
