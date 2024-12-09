import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiRequestQuickViewComponent } from './li-request-quick-view.component';

describe('LiRequestQuickViewComponent', () => {
  let component: LiRequestQuickViewComponent;
  let fixture: ComponentFixture<LiRequestQuickViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiRequestQuickViewComponent]
    });
    fixture = TestBed.createComponent(LiRequestQuickViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
