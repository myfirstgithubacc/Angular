import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCancelCodeComponent } from './core-cancel-code.component';

describe('CoreCancelCodeComponent', () => {
  let component: CoreCancelCodeComponent;
  let fixture: ComponentFixture<CoreCancelCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreCancelCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreCancelCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
