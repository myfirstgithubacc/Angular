import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreExtraComponent } from './core-extra.component';

describe('CoreExtraComponent', () => {
  let component: CoreExtraComponent;
  let fixture: ComponentFixture<CoreExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreExtraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
