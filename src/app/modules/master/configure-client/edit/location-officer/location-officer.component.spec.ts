import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationOfficerComponent } from './location-officer.component';

describe('LocationOfficerComponent', () => {
  let component: LocationOfficerComponent;
  let fixture: ComponentFixture<LocationOfficerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocationOfficerComponent]
    });
    fixture = TestBed.createComponent(LocationOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
