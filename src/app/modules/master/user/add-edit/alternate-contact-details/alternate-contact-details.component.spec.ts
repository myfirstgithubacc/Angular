import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlternateContactDetailsComponent } from './alternate-contact-details.component';

describe('AlternateContactDetailsComponent', () => {
  let component: AlternateContactDetailsComponent;
  let fixture: ComponentFixture<AlternateContactDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlternateContactDetailsComponent]
    });
    fixture = TestBed.createComponent(AlternateContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
