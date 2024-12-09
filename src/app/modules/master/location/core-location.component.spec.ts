import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreLocationComponent } from './core-location.component';

describe('CoreLocationComponent', () => {
  let component: CoreLocationComponent;
  let fixture: ComponentFixture<CoreLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
