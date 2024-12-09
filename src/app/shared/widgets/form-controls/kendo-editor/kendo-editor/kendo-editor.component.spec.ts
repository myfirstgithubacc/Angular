import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoEditorComponent } from './kendo-editor.component';

describe('KendoEditorComponent', () => {
  let component: KendoEditorComponent;
  let fixture: ComponentFixture<KendoEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KendoEditorComponent]
    });
    fixture = TestBed.createComponent(KendoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
