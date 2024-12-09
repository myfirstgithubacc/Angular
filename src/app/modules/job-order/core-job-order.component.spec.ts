import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreJobOrderComponent } from './core-job-order.component';

describe('CoreJobOrderComponent', () => {
  let component: CoreJobOrderComponent;
  let fixture: ComponentFixture<CoreJobOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreJobOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreJobOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
