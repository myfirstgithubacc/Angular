import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRequisitionLibraryComponent } from './core-requisition-library.component';

describe('CoreRequisitionLibraryComponent', () => {
  let component: CoreRequisitionLibraryComponent;
  let fixture: ComponentFixture<CoreRequisitionLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreRequisitionLibraryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreRequisitionLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
