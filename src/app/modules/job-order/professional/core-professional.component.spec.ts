import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreProfessionalComponent } from './core-professional.component';

describe('CoreProfessionalComponent', () => {
  let component: CoreProfessionalComponent;
  let fixture: ComponentFixture<CoreProfessionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreProfessionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoreProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
