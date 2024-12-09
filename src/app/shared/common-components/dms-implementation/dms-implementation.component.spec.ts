import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmsImplementationComponent } from './dms-implementation.component';

describe('DmsImplementationComponent', () => {
  let component: DmsImplementationComponent;
  let fixture: ComponentFixture<DmsImplementationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DmsImplementationComponent]
    });
    fixture = TestBed.createComponent(DmsImplementationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
