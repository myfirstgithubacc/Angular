import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterSelectionComponent } from './parameter-selection.component';

describe('ParameterSelectionComponent', () => {
  let component: ParameterSelectionComponent;
  let fixture: ComponentFixture<ParameterSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterSelectionComponent]
    });
    fixture = TestBed.createComponent(ParameterSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
