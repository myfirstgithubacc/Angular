import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreDocumentConfigurationComponent } from './core-document-configuration.component';

describe('CoreDocumentConfigurationComponent', () => {
  let component: CoreDocumentConfigurationComponent;
  let fixture: ComponentFixture<CoreDocumentConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreDocumentConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreDocumentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
