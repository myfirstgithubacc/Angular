import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreSampleComponent } from './core-sample.component';

describe('CoreSampleComponent', () => {
  let component: CoreSampleComponent;
  let fixture: ComponentFixture<CoreSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreSampleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
