import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreInterviewComponent } from './core-interview.component';

describe('CoreInterviewComponent', () => {
  let component: CoreInterviewComponent;
  let fixture: ComponentFixture<CoreInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreInterviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoreInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
