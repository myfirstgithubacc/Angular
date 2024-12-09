import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutViewComponent } from './in-out-view.component';

describe('InOutViewComponent', () => {
  let component: InOutViewComponent;
  let fixture: ComponentFixture<InOutViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InOutViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InOutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
