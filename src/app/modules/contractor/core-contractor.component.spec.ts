import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreContractorComponent } from './core-contractor.component';

describe('CoreContractorComponent', () => {
  let component: CoreContractorComponent;
  let fixture: ComponentFixture<CoreContractorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreContractorComponent]
    });
    fixture = TestBed.createComponent(CoreContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
