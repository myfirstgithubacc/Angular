import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPopupTextAreaComponent } from './confirmation-popup-text-area.component';

describe('ConfirmationPopupTextAreaComponent', () => {
  let component: ConfirmationPopupTextAreaComponent;
  let fixture: ComponentFixture<ConfirmationPopupTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationPopupTextAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationPopupTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
