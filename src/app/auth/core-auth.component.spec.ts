import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreAuthComponent } from './core-auth.component';

describe('CoreAuthComponent', () => {
  let component: CoreAuthComponent;
  let fixture: ComponentFixture<CoreAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreAuthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
