/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { User_activationComponent } from './user_activation.component';

describe('User_activationComponent', () => {
  let component: User_activationComponent;
  let fixture: ComponentFixture<User_activationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ User_activationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(User_activationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
