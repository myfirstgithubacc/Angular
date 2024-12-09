import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRetireeOptionsComponent } from './core-retiree-options.component';

describe('CoreRetireeOptionsComponent', () => {
  let component: CoreRetireeOptionsComponent;
  let fixture: ComponentFixture<CoreRetireeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreRetireeOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreRetireeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
