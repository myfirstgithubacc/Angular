import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreBackendUploadComponent } from './core-bulk-data-management.component';

describe('CoreBackendUploadComponent', () => {
  let component: CoreBackendUploadComponent;
  let fixture: ComponentFixture<CoreBackendUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreBackendUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreBackendUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
