import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreContractorDetailsComponent } from './core-contractor-details.component';

describe('CoreContractorDetailsComponent', () => {
  let component: CoreContractorDetailsComponent;
  let fixture: ComponentFixture<CoreContractorDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreContractorDetailsComponent]
    });
    fixture = TestBed.createComponent(CoreContractorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
