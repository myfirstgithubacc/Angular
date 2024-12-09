import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserNotSupportedComponent } from './browser-not-supported.component';

describe('BrowserNotSupportedComponent', () => {
  let component: BrowserNotSupportedComponent;
  let fixture: ComponentFixture<BrowserNotSupportedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserNotSupportedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BrowserNotSupportedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
