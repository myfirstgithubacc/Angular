import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginMethodComponent } from './login-method.component';

describe('LoginMethodComponent', () => {
  let component: LoginMethodComponent;
  let fixture: ComponentFixture<LoginMethodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginMethodComponent]
    });
    fixture = TestBed.createComponent(LoginMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
