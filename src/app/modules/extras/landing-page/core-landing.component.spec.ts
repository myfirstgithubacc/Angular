import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreLandingComponent } from './core-landing.component';

describe('CoreLandingComponent', () => {
  let component: CoreLandingComponent;
  let fixture: ComponentFixture<CoreLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreLandingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
