import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundChecksComponent } from './background-checks.component';

describe('BackgroundChecksComponent', () => {
  let component: BackgroundChecksComponent;
  let fixture: ComponentFixture<BackgroundChecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundChecksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
