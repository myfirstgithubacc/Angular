import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddEditComponent } from './popup-add-edit.component';

describe('PopupAddEditComponent', () => {
  let component: PopupAddEditComponent;
  let fixture: ComponentFixture<PopupAddEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupAddEditComponent]
    });
    fixture = TestBed.createComponent(PopupAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
