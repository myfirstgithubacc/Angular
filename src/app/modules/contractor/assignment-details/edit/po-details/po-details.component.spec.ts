import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PODetailsComponent } from './po-details.component';

describe('PODetailsComponent', () => {
  let component: PODetailsComponent;
  let fixture: ComponentFixture<PODetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PODetailsComponent]
    });
    fixture = TestBed.createComponent(PODetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
