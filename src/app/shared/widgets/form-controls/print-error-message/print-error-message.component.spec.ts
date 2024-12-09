import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintErrorMessageComponent } from './print-error-message.component';

describe('PrintErrorMessageComponent', () => {
  let component: PrintErrorMessageComponent;
  let fixture: ComponentFixture<PrintErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintErrorMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
