import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreReactiveformsComponent } from './core-reactiveforms.component';

describe('CoreReactiveformsComponent', () => {
  let component: CoreReactiveformsComponent;
  let fixture: ComponentFixture<CoreReactiveformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreReactiveformsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreReactiveformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
