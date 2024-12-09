import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreEventsComponent } from './core-events.component';

describe('CoreEventsComponent', () => {
  let component: CoreEventsComponent;
  let fixture: ComponentFixture<CoreEventsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreEventsComponent]
    });
    fixture = TestBed.createComponent(CoreEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
