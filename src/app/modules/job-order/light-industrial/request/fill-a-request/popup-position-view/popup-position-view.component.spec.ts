import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPositionViewComponent } from './popup-position-view.component';

describe('PopupPositionViewComponent', () => {
  let component: PopupPositionViewComponent;
  let fixture: ComponentFixture<PopupPositionViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupPositionViewComponent]
    });
    fixture = TestBed.createComponent(PopupPositionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
