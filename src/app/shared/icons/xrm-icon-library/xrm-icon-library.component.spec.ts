import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XRMIconLibraryComponent } from './xrm-icon-library.component';

describe('XRMIconLibraryComponent', () => {
  let component: XRMIconLibraryComponent;
  let fixture: ComponentFixture<XRMIconLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [XRMIconLibraryComponent]
    });
    fixture = TestBed.createComponent(XRMIconLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
