import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRoleComponent } from './core-role.component';

describe('CoreRoleComponent', () => {
  let component: CoreRoleComponent;
  let fixture: ComponentFixture<CoreRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreRoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
