import { ComponentFixture, TestBed } from '@angular/core/testing';

import { COETestingComponent } from './coe-testing.component';

describe('COETestingComponent', () => {
  let component: COETestingComponent;
  let fixture: ComponentFixture<COETestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ COETestingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(COETestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
